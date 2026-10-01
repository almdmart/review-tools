"use client";

import { toast } from "sonner";
import { EditorSection } from "@/components/common/EditorSection";
import { UploadField } from "@/components/common/UploadField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAssetIfUnused, uploadImageAsset } from "@/lib/project-actions";
import { useProjectStore } from "@/store/project-store";

export function ConversationSettings() {
  const participant = useProjectStore((state) => state.participant);
  const setParticipant = useProjectStore((state) => state.setParticipant);

  async function onSelect(file: File) {
    const previous = useProjectStore.getState().participant.avatarId;
    try {
      const imageId = await uploadImageAsset(file);
      setParticipant({ avatarId: imageId });
      await deleteAssetIfUnused(previous);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload that photo.");
    }
  }

  async function onRemove() {
    const previous = useProjectStore.getState().participant.avatarId;
    setParticipant({ avatarId: undefined });
    await deleteAssetIfUnused(previous);
  }

  return (
    <EditorSection title="Conversation settings">
      <UploadField
        imageId={participant.avatarId}
        label="Participant photo"
        shape="circle"
        onSelect={(file) => void onSelect(file)}
        onRemove={() => void onRemove()}
      />
      <div className="grid gap-1.5">
        <Label htmlFor="participant-name">Name</Label>
        <Input
          id="participant-name"
          data-testid="participant-name"
          value={participant.name}
          onChange={(event) => setParticipant({ name: event.target.value })}
          placeholder="Name"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="participant-status">Status</Label>
        <Input
          id="participant-status"
          data-testid="participant-status"
          value={participant.status}
          onChange={(event) => setParticipant({ status: event.target.value })}
          placeholder="Active now"
        />
      </div>
    </EditorSection>
  );
}
