"use client";

import { useEffect, useRef, useState } from "react";
import { MessengerPhonePreview } from "@/components/preview/MessengerPhonePreview";
import type { PreviewZoom } from "@/lib/schema";
import { useProjectStore } from "@/store/project-store";
import { cn } from "cn";

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 780;
const ZOOMS: PreviewZoom[] = ["fit", "75", "100", "125"];

export function PreviewWorkspace() {
  const zoom = useProjectStore((state) => state.previewSettings.zoom);
  const setPreviewSettings = useProjectStore((state) => state.setPreviewSettings);
  const frameRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.8);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;
    const update = () => {
      const styles = getComputedStyle(element);
      const padX = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
      const padY = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
      const width = element.clientWidth - padX;
      const height = element.clientHeight - padY;
      setFitScale(Math.max(0.35, Math.min(1, width / PHONE_WIDTH, height / PHONE_HEIGHT)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = zoom === "fit" ? fitScale : Number(zoom) / 100;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--editor-canvas)]">
      <div className="flex shrink-0 items-center justify-end gap-1 border-b bg-background px-3 py-2">
        <span className="mr-auto text-xs font-medium text-muted-foreground">Preview</span>
        {ZOOMS.map((option) => (
          <button
            key={option}
            type="button"
            data-testid={`zoom-${option}`}
            onClick={() => setPreviewSettings({ zoom: option })}
            className={cn(
              "h-7 rounded-md px-2 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              zoom === option ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {option === "fit" ? "Fit" : `${option}%`}
          </button>
        ))}
      </div>
      <div ref={frameRef} className="min-h-0 flex-1 overflow-auto p-8">
        <div className="mx-auto" style={{ width: PHONE_WIDTH * scale, height: PHONE_HEIGHT * scale }}>
          <div style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <MessengerPhonePreview />
          </div>
        </div>
      </div>
    </div>
  );
}
