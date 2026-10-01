const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return "Use a JPEG, PNG, WebP, or GIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Images need to be 8 MB or smaller.";
  }
  return null;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read the image."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the image."));
    reader.readAsDataURL(blob);
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = /data:(.*?);/.exec(header ?? "")?.[1] ?? "application/octet-stream";
  const binary = atob(data ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

export function safeDownloadName(name: string, extension: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\-_]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${cleaned || "messenger-conversation"}.${extension}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadText(contents: string, filename: string, type = "application/json") {
  downloadBlob(new Blob([contents], { type }), filename);
}
