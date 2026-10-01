"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  ImageIcon,
  MessageSquare,
  Clock3,
  Trash2,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EmojiInsertButton } from "@/components/editor/EmojiInsertButton";
import { UploadField } from "@/components/common/UploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { senderLabel } from "@/lib/grouping";
import { deleteAssetIfUnused, uploadImageAsset } from "@/lib/project-actions";
import type { MessageType, Sender } from "@/lib/schema";
import { useProjectStore } from "@/store/project-store";
import { cn } from "cn";

const typeOptions: { value: MessageType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "time", label: "Time" },
];

function MessageEditorCardComponent({ id }: { id: string }) {
  const message = useProjectStore((state) => state.messages.find((item) => item.id === id));
  const participantName = useProjectStore((state) => state.participant.name);
  const active = useProjectStore((state) => state.activeMessageId === id);
  const updateMessage = useProjectStore((state) => state.updateMessage);
  const duplicateMessage = useProjectStore((state) => state.duplicateMessage);
  const deleteMessage = useProjectStore((state) => state.deleteMessage);
  const moveMessage = useProjectStore((state) => state.moveMessage);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  useEffect(() => {
    if (active && message?.type === "text") textRef.current?.focus();
  }, [active, message?.type]);

  if (!message) return null;

  const label = senderLabel(message.sender, participantName);
  const summary =
    message.type === "image"
      ? "Image"
      : message.text?.trim() || (message.type === "time" ? "Time" : "Empty message");

  async function onImage(file: File) {
    const previous = message?.imageId;
    try {
      const imageId = await uploadImageAsset(file);
      updateMessage(id, { imageId });
      await deleteAssetIfUnused(previous);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload that image.");
    }
  }

  async function removeImage() {
    const previous = message?.imageId;
    updateMessage(id, { imageId: undefined });
    await deleteAssetIfUnused(previous);
  }

  function insertEmoji(emoji: string) {
    const current = message?.text ?? "";
    const element = textRef.current;
    const start = element?.selectionStart ?? current.length;
    const end = element?.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}${emoji}${current.slice(end)}`;
    updateMessage(id, { text: next });
    requestAnimationFrame(() => {
      element?.focus();
      const caret = start + emoji.length;
      element?.setSelectionRange(caret, caret);
    });
  }

  return (
    <article
      ref={setNodeRef}
      data-testid="message-card"
      data-message-id={id}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-lg border bg-background",
        isDragging && "z-10 shadow-md",
      )}
    >
      <div className="flex items-center gap-1 px-1.5 py-1">
        <button
          type="button"
          className="grid size-7 cursor-grab place-items-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium">{label}</span>
        <span className="text-muted-foreground">
          {message.type === "image" ? (
            <ImageIcon className="size-3.5" />
          ) : message.type === "time" ? (
            <Clock3 className="size-3.5" />
          ) : (
            <MessageSquare className="size-3.5" />
          )}
        </span>
        {collapsed ? <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{summary}</span> : <span className="flex-1" />}
        <Button type="button" variant="ghost" size="icon-xs" aria-label="Move up" onClick={() => moveMessage(id, -1)}>
          <ChevronUp />
        </Button>
        <Button type="button" variant="ghost" size="icon-xs" aria-label="Move down" onClick={() => moveMessage(id, 1)}>
          <ChevronDown />
        </Button>
        <Button type="button" variant="ghost" size="icon-xs" aria-label="Duplicate message" onClick={() => duplicateMessage(id)}>
          <Copy />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Delete message"
          onClick={() => {
            const imageId = message.imageId;
            deleteMessage(id);
            void deleteAssetIfUnused(imageId);
          }}
        >
          <Trash2 />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={collapsed ? "Expand message" : "Collapse message"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
        >
          <ChevronDown className={cn("transition-transform", !collapsed && "rotate-180")} />
        </Button>
      </div>
      {collapsed ? null : (
        <div className="grid gap-2 px-2.5 pb-2.5">
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={message.sender}
              items={{
                participant: senderLabel("participant", participantName),
                self: "Me",
              }}
              onValueChange={(value) => {
                if (value) updateMessage(id, { sender: value as Sender });
              }}
            >
              <SelectTrigger aria-label="Sender" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">{senderLabel("participant", participantName)}</SelectItem>
                <SelectItem value="self">Me</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={message.type}
              items={Object.fromEntries(typeOptions.map((option) => [option.value, option.label]))}
              onValueChange={(value) => {
                if (value) updateMessage(id, { type: value as MessageType });
              }}
            >
              <SelectTrigger aria-label="Message type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {message.type === "text" ? (
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Text</span>
                <EmojiInsertButton onSelect={insertEmoji} />
              </div>
              <Textarea
                ref={textRef}
                aria-label="Message text"
                value={message.text ?? ""}
                onChange={(event) => updateMessage(id, { text: event.target.value })}
                placeholder="Write a message"
                className="max-h-40 min-h-16"
              />
            </div>
          ) : null}
          {message.type === "image" ? (
            <UploadField
              imageId={message.imageId}
              label="Message image"
              onSelect={(file) => void onImage(file)}
              onRemove={() => void removeImage()}
            />
          ) : null}
          {message.type === "time" ? (
            <Input
              aria-label="Time separator"
              value={message.text ?? ""}
              onChange={(event) => updateMessage(id, { text: event.target.value })}
              placeholder="10:42 PM"
            />
          ) : null}
          {message.type !== "time" ? (
            <Input
              aria-label="Timestamp"
              value={message.timestamp ?? ""}
              onChange={(event) => updateMessage(id, { timestamp: event.target.value })}
              placeholder="Timestamp, optional"
            />
          ) : null}
        </div>
      )}
    </article>
  );
}

export const MessageEditorCard = memo(MessageEditorCardComponent);
