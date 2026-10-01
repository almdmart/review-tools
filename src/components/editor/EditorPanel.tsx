"use client";

import { ConversationSettings } from "@/components/editor/ConversationSettings";
import { MessageList } from "@/components/editor/MessageList";
import { PhoneSettings } from "@/components/editor/PhoneSettings";
import { PreviewSettings } from "@/components/editor/PreviewSettings";

export function EditorPanel() {
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-background">
      <div className="flex flex-col gap-5 px-4 py-4">
        <ConversationSettings />
        <PhoneSettings />
        <PreviewSettings />
        <MessageList />
      </div>
    </div>
  );
}
