"use client";

import { useState } from "react";
import { AppHeader } from "@/components/editor/AppHeader";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { ProjectProvider } from "@/components/project/ProjectProvider";
import { PreviewWorkspace } from "@/components/preview/PreviewWorkspace";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectStore } from "@/store/project-store";
import { cn } from "cn";

function Workspace() {
  const hydrated = useProjectStore((state) => state.hydrated);
  const [panel, setPanel] = useState("editor");

  if (!hydrated) {
    return (
      <div className="grid h-full place-items-center text-sm text-muted-foreground">
        Loading project…
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col" data-hydrated="true">
      <AppHeader />
      <div className="border-b px-3 py-2 lg:hidden">
        <Tabs value={panel} onValueChange={setPanel}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor" data-testid="tab-editor">
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" data-testid="tab-preview">
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "min-h-0 w-full border-r lg:w-[40%] lg:max-w-[560px] lg:min-w-[360px]",
            panel !== "editor" && "hidden lg:block",
          )}
        >
          <EditorPanel />
        </aside>
        <main className={cn("min-h-0 min-w-0 flex-1", panel !== "preview" && "hidden lg:block")}>
          <PreviewWorkspace />
        </main>
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <ProjectProvider>
      <Workspace />
    </ProjectProvider>
  );
}
