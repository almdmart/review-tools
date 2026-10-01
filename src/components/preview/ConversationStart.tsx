"use client";

import { ParticipantAvatar } from "@/components/preview/ParticipantAvatar";
import { useProjectStore } from "@/store/project-store";

export function ConversationStart({ large }: { large: boolean }) {
  const name = useProjectStore((state) => state.participant.name);
  const status = useProjectStore((state) => state.participant.status);
  const active = /^active now$/i.test(status.trim());

  return (
    <div className={large ? "flex flex-1 flex-col items-center justify-center px-8 text-center" : "flex flex-col items-center px-8 pt-6 pb-2 text-center"}>
      <ParticipantAvatar size={large ? 88 : 72} />
      <p className="mt-3 text-[20px] leading-6 font-semibold">{name.trim() || "Messenger"}</p>
      <p
        className="mt-1 text-[13px]"
        style={{ color: active ? "var(--messenger-active)" : "var(--messenger-muted)" }}
      >
        {status || "Messenger"}
      </p>
    </div>
  );
}
