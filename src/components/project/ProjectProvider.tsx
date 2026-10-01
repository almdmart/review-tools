"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { hydrateAssets, loadStoredProject, seedDemoAsset } from "@/lib/assets";
import { createDemoProject } from "@/lib/defaults";
import { persistCurrentProject } from "@/lib/project-actions";
import { useProjectStore } from "@/store/project-store";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useProjectStore((state) => state.hydrated);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        await hydrateAssets();
        const stored = await loadStoredProject();
        if (cancelled) return;
        if (stored) {
          useProjectStore.getState().replaceProject(stored);
        } else {
          await seedDemoAsset();
          const demo = createDemoProject();
          useProjectStore.getState().replaceProject(demo);
          await persistCurrentProject();
        }
        if (!cancelled) useProjectStore.getState().setSaveStatus("saved");
      } catch {
        if (cancelled) return;
        try {
          await seedDemoAsset();
        } catch {
          // The demo image is optional if storage is unavailable.
        }
        useProjectStore.getState().replaceProject(createDemoProject());
        useProjectStore.getState().setSaveStatus("error");
        toast.error("Saved project could not be read. A fresh example was loaded.");
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let timer = 0;
    const unsubscribe = useProjectStore.subscribe((state, previous) => {
      if (state.updatedAt === previous.updatedAt) return;
      useProjectStore.getState().setSaveStatus("saving");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void persistCurrentProject()
          .then(() => useProjectStore.getState().setSaveStatus("saved"))
          .catch(() => {
            useProjectStore.getState().setSaveStatus("error");
            toast.error("Could not save this project locally.");
          });
      }, 400);
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, [hydrated]);

  return children;
}
