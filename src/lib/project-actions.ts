import {
  assetsFromPortable,
  deleteAsset,
  exportReferencedAssets,
  replaceAssets,
  retainOnly,
  saveAssetFile,
  saveStoredProject,
  seedDemoAsset,
} from "@/lib/assets";
import { createDemoProject, DEMO_IMAGE_ID } from "@/lib/defaults";
import { validateImageFile } from "@/lib/images";
import { formatZodError, portableProjectSchema, type ProjectDocument } from "@/lib/schema";
import {
  referencedAssetIds,
  selectProjectDocument,
  useProjectStore,
} from "@/store/project-store";

export class ProjectImportError extends Error {}

export async function persistCurrentProject() {
  const project = selectProjectDocument(useProjectStore.getState());
  await saveStoredProject(project);
}

export async function uploadImageAsset(file: File): Promise<string> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);
  return saveAssetFile(file);
}

export async function deleteAssetIfUnused(id: string | undefined) {
  if (!id) return;
  if (referencedAssetIds(useProjectStore.getState()).includes(id)) return;
  await deleteAsset(id);
}

async function applyProject(project: ProjectDocument, assetIds: string[]) {
  await retainOnly(assetIds);
  useProjectStore.getState().replaceProject(project);
  await persistCurrentProject();
  useProjectStore.getState().setSaveStatus("saved");
}

export async function startNewProject() {
  await seedDemoAsset();
  const project = createDemoProject();
  await applyProject(project, [DEMO_IMAGE_ID]);
}

export async function resetProject() {
  await seedDemoAsset();
  const project = createDemoProject();
  project.id = useProjectStore.getState().projectId;
  await applyProject(project, [DEMO_IMAGE_ID]);
}

export async function buildPortableProject() {
  const state = useProjectStore.getState();
  const project = selectProjectDocument(state);
  const assets = await exportReferencedAssets(referencedAssetIds(state));
  return { ...project, assets };
}

export async function importProjectData(data: unknown) {
  const parsed = portableProjectSchema.safeParse(data);
  if (!parsed.success) {
    throw new ProjectImportError(formatZodError(parsed.error) || "This project file is invalid.");
  }
  const { assets, ...project } = parsed.data;
  await replaceAssets(assetsFromPortable(assets));
  useProjectStore.getState().replaceProject(project);
  await persistCurrentProject();
  useProjectStore.getState().setSaveStatus("saved");
}
