import { getDb, PROJECT_KEY, type AssetRecord } from "@/lib/db";
import { DEMO_IMAGE_ID } from "@/lib/defaults";
import { blobToDataUrl, dataUrlToBlob } from "@/lib/images";
import { createId } from "@/lib/ids";
import type { PortableAsset, ProjectDocument } from "@/lib/schema";
import { projectSchema } from "@/lib/schema";

const urls = new Map<string, string>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeAssets(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAssetUrl(id: string | undefined): string | undefined {
  if (!id) return undefined;
  return urls.get(id);
}

function remember(id: string, blob: Blob) {
  const previous = urls.get(id);
  if (previous) URL.revokeObjectURL(previous);
  urls.set(id, URL.createObjectURL(blob));
}

function revokeAll() {
  for (const url of urls.values()) URL.revokeObjectURL(url);
  urls.clear();
}

export async function hydrateAssets() {
  const database = await getDb();
  const records = await database.getAll("assets");
  revokeAll();
  for (const record of records) remember(record.id, record.blob);
  emit();
}

export async function saveAssetFile(file: File): Promise<string> {
  const id = createId();
  const record: AssetRecord = { id, blob: file, mime: file.type };
  const database = await getDb();
  await database.put("assets", record, id);
  remember(id, file);
  emit();
  return id;
}

export async function deleteAsset(id: string) {
  const database = await getDb();
  await database.delete("assets", id);
  const url = urls.get(id);
  if (url) URL.revokeObjectURL(url);
  urls.delete(id);
  emit();
}

export async function getAsset(id: string): Promise<AssetRecord | undefined> {
  const database = await getDb();
  return database.get("assets", id);
}

export async function replaceAssets(records: AssetRecord[]) {
  const database = await getDb();
  const tx = database.transaction("assets", "readwrite");
  await tx.store.clear();
  for (const record of records) {
    await tx.store.put(record, record.id);
  }
  await tx.done;
  revokeAll();
  for (const record of records) remember(record.id, record.blob);
  emit();
}

export async function loadStoredProject(): Promise<ProjectDocument | null> {
  const database = await getDb();
  const stored = await database.get("project", PROJECT_KEY);
  if (!stored) return null;
  const parsed = projectSchema.safeParse(stored);
  if (!parsed.success) return null;
  return parsed.data;
}

export async function saveStoredProject(project: ProjectDocument) {
  const database = await getDb();
  await database.put("project", project, PROJECT_KEY);
}

export async function seedDemoAsset() {
  const database = await getDb();
  const existing = await database.get("assets", DEMO_IMAGE_ID);
  if (!existing) {
    const response = await fetch("/demo-photo.png");
    if (!response.ok) throw new Error("Could not load the demo image.");
    const blob = await response.blob();
    await database.put("assets", { id: DEMO_IMAGE_ID, blob, mime: "image/png" }, DEMO_IMAGE_ID);
  }
  const record = await database.get("assets", DEMO_IMAGE_ID);
  if (record) remember(DEMO_IMAGE_ID, record.blob);
  emit();
}

export async function retainOnly(ids: string[]) {
  const keep = new Set(ids);
  const database = await getDb();
  const records = await database.getAll("assets");
  const tx = database.transaction("assets", "readwrite");
  for (const record of records) {
    if (!keep.has(record.id)) await tx.store.delete(record.id);
  }
  await tx.done;
  for (const id of [...urls.keys()]) {
    if (!keep.has(id)) {
      const url = urls.get(id);
      if (url) URL.revokeObjectURL(url);
      urls.delete(id);
    }
  }
  emit();
}

export async function exportReferencedAssets(ids: string[]): Promise<PortableAsset[]> {
  const assets: PortableAsset[] = [];
  for (const id of ids) {
    const record = await getAsset(id);
    if (!record) continue;
    assets.push({
      id,
      mime: record.mime,
      dataUrl: await blobToDataUrl(record.blob),
    });
  }
  return assets;
}

export function assetsFromPortable(assets: PortableAsset[]): AssetRecord[] {
  return assets.map((asset) => ({
    id: asset.id,
    mime: asset.mime,
    blob: dataUrlToBlob(asset.dataUrl),
  }));
}
