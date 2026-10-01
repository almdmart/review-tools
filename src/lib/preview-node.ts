let previewNode: HTMLElement | null = null;

export function setPreviewNode(node: HTMLElement | null) {
  previewNode = node;
}

export function getPreviewNode() {
  return previewNode;
}
