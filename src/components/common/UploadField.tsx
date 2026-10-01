/* eslint-disable @next/next/no-img-element -- local blob previews are not next/image sources */
"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAssetUrl } from "@/components/project/use-asset-url";
import { Button } from "@/components/ui/button";
import { validateImageFile } from "@/lib/images";
import { cn } from "cn";

export function UploadField({
  imageId,
  label,
  shape = "rounded",
  onSelect,
  onRemove,
}: {
  imageId?: string;
  label: string;
  shape?: "circle" | "rounded";
  onSelect: (file: File) => void;
  onRemove?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const url = useAssetUrl(imageId);
  const [dragging, setDragging] = useState(false);

  function take(file: File | undefined) {
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    onSelect(file);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          take(event.dataTransfer.files[0]);
        }}
        className={cn(
          "relative grid size-14 shrink-0 place-items-center overflow-hidden border bg-muted text-muted-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50",
          shape === "circle" ? "rounded-full" : "rounded-lg",
          dragging && "border-foreground",
        )}
      >
        {url ? (
          <img src={url} alt="" className="size-full object-cover" />
        ) : (
          <ImagePlus className="size-4" />
        )}
      </button>
      <div className="flex flex-wrap gap-1.5">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          {url ? "Replace" : "Upload"}
        </Button>
        {url && onRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove ${label}`}>
            <Trash2 />
            Remove
          </Button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        aria-label={label}
        onChange={(event) => {
          take(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
