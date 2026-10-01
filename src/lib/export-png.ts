import { domToBlob } from "modern-screenshot";

async function inlineImages(root: HTMLElement) {
  const images = [...root.querySelectorAll("img")];
  const originals: Array<[HTMLImageElement, string]> = [];
  await Promise.all(
    images.map(async (image) => {
      const source = image.currentSrc || image.src;
      if (!source || source.startsWith("data:")) return;
      const response = await fetch(source);
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Could not read an image for export."));
        };
        reader.onerror = () => reject(reader.error ?? new Error("Could not read an image for export."));
        reader.readAsDataURL(blob);
      });
      originals.push([image, image.src]);
      image.src = dataUrl;
      await image.decode().catch(() => undefined);
    }),
  );
  return () => {
    for (const [image, source] of originals) image.src = source;
  };
}

export async function capturePreviewPng(node: HTMLElement): Promise<Blob> {
  const restore = await inlineImages(node);
  try {
    const blob = await domToBlob(node, {
      scale: 2,
      backgroundColor: "#ffffff",
      width: node.offsetWidth,
      height: node.offsetHeight,
    });
    if (!blob) throw new Error("Could not create the PNG.");
    return blob;
  } finally {
    restore();
  }
}
