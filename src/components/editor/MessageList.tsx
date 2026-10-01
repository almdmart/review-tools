"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { AddMultipleDialog } from "@/components/editor/AddMultipleDialog";
import { MessageEditorCard } from "@/components/editor/MessageEditorCard";
import { EditorSection } from "@/components/common/EditorSection";
import { Button } from "@/components/ui/button";
import { senderLabel } from "@/lib/grouping";
import { addQuickMessage, useProjectStore } from "@/store/project-store";

export function MessageList() {
  const ids = useProjectStore(useShallow((state) => state.messages.map((message) => message.id)));
  const participantName = useProjectStore((state) => state.participant.name);
  const [bulkOpen, setBulkOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const messages = useProjectStore.getState().messages;
    const from = messages.findIndex((message) => message.id === active.id);
    const to = messages.findIndex((message) => message.id === over.id);
    useProjectStore.getState().reorderMessages(from, to);
  }

  const name = senderLabel("participant", participantName);

  return (
    <EditorSection
      title="Messages"
      action={
        <Button
          type="button"
          size="sm"
          data-testid="add-message"
          onClick={() => addQuickMessage("participant")}
        >
          <Plus />
          Add message
        </Button>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        <Button type="button" variant="outline" size="sm" data-testid="add-participant" onClick={() => addQuickMessage("participant")}>
          Add {name}
        </Button>
        <Button type="button" variant="outline" size="sm" data-testid="add-self" onClick={() => addQuickMessage("self")}>
          Add me
        </Button>
        {[2, 3, 5].map((count) => (
          <Button
            key={count}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addQuickMessage("participant", count)}
          >
            Add {count}
          </Button>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={() => setBulkOpen(true)}>
          Custom…
        </Button>
      </div>
      {ids.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
          No messages yet. Add one to build the conversation.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {ids.map((id) => (
                <MessageEditorCard key={id} id={id} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <AddMultipleDialog open={bulkOpen} onOpenChange={setBulkOpen} />
    </EditorSection>
  );
}
