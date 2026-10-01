"use client";

import {
  Download,
  FileDown,
  FileUp,
  Plus,
  RotateCcw,
  Save,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ToolbarButton } from "@/components/common/ToolbarButton";
import { capturePreviewPng } from "@/lib/export-png";
import { downloadBlob, downloadText, safeDownloadName } from "@/lib/images";
import { getPreviewNode } from "@/lib/preview-node";
import {
  buildPortableProject,
  importProjectData,
  persistCurrentProject,
  ProjectImportError,
  resetProject,
  startNewProject,
} from "@/lib/project-actions";
import { useProjectStore } from "@/store/project-store";

export function AppHeader() {
  const saveStatus = useProjectStore((state) => state.saveStatus);
  const participantName = useProjectStore((state) => state.participant.name);
  const importRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<null | "new" | "reset">(null);
  const [busy, setBusy] = useState(false);

  const statusLabel =
    saveStatus === "saving" ? "Saving…" : saveStatus === "error" ? "Save failed" : saveStatus === "saved" ? "Saved locally" : "";

  async function onSave() {
    useProjectStore.getState().setSaveStatus("saving");
    try {
      await persistCurrentProject();
      useProjectStore.getState().setSaveStatus("saved");
      toast.success("Saved locally");
    } catch {
      useProjectStore.getState().setSaveStatus("error");
      toast.error("Could not save this project locally.");
    }
  }

  async function onExportProject() {
    try {
      const project = await buildPortableProject();
      downloadText(
        JSON.stringify(project, null, 2),
        safeDownloadName(participantName, "json"),
      );
    } catch {
      toast.error("Could not export this project.");
    }
  }

  async function onExportImage() {
    const node = getPreviewNode();
    if (!node) {
      toast.error("The preview is not ready to export.");
      return;
    }
    setBusy(true);
    try {
      const blob = await capturePreviewPng(node);
      downloadBlob(blob, safeDownloadName(participantName, "png"));
    } catch {
      toast.error("Could not export the preview image.");
    } finally {
      setBusy(false);
    }
  }

  async function onImport(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const data: unknown = JSON.parse(text);
      await importProjectData(data);
      toast.success("Project imported");
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error("That file is not valid JSON.");
        return;
      }
      toast.error(error instanceof ProjectImportError ? error.message : "Could not import that project.");
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-3 sm:px-4">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold tracking-tight">Conversation Mockup Builder</h1>
        <p data-testid="save-status" className="truncate text-[11px] text-muted-foreground" aria-live="polite">
          {statusLabel}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ToolbarButton type="button" variant="ghost" size="sm" tooltip="Start a new example conversation" data-testid="new-project" onClick={() => setConfirm("new")}>
          <Plus />
          <span className="hidden md:inline">New</span>
        </ToolbarButton>
        <ToolbarButton type="button" variant="ghost" size="sm" tooltip="Save the project in this browser" data-testid="save-project" onClick={() => void onSave()}>
          <Save />
          <span className="hidden md:inline">Save</span>
        </ToolbarButton>
        <ToolbarButton type="button" variant="ghost" size="sm" tooltip="Import a project file" data-testid="import-project" onClick={() => importRef.current?.click()}>
          <FileUp />
          <span className="hidden md:inline">Import</span>
        </ToolbarButton>
        <ToolbarButton type="button" variant="ghost" size="sm" tooltip="Download a portable project file" data-testid="export-project" onClick={() => void onExportProject()}>
          <FileDown />
          <span className="hidden lg:inline">Export project</span>
        </ToolbarButton>
        <ToolbarButton type="button" variant="ghost" size="sm" tooltip="Restore the example conversation" data-testid="reset-project" onClick={() => setConfirm("reset")}>
          <RotateCcw />
          <span className="hidden md:inline">Reset</span>
        </ToolbarButton>
        <ToolbarButton type="button" size="sm" tooltip="Download a PNG of the phone preview" data-testid="export-image" disabled={busy} onClick={() => void onExportImage()}>
          <Download />
          <span className="hidden sm:inline">Export image</span>
        </ToolbarButton>
      </div>
      <input
        ref={importRef}
        data-testid="import-input"
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label="Import project file"
        onChange={(event) => {
          void onImport(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <ConfirmDialog
        open={confirm === "new"}
        title="Start a new project?"
        description="This replaces the current conversation with the example. Unsaved edits in this browser will be overwritten."
        confirmLabel="New project"
        onOpenChange={(open) => setConfirm(open ? "new" : null)}
        onConfirm={() => void startNewProject()}
      />
      <ConfirmDialog
        open={confirm === "reset"}
        title="Reset this project?"
        description="Messages, the participant, and phone settings return to the example conversation."
        confirmLabel="Reset"
        onOpenChange={(open) => setConfirm(open ? "reset" : null)}
        onConfirm={() => void resetProject()}
      />
    </header>
  );
}
