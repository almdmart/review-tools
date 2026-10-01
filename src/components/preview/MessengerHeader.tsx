"use client";

import { ChevronLeft, Info, Phone, Video } from "lucide-react";
import { ParticipantAvatar } from "@/components/preview/ParticipantAvatar";
import { useProjectStore } from "@/store/project-store";

export function MessengerHeader() {
  const name = useProjectStore((state) => state.participant.name);
  const status = useProjectStore((state) => state.participant.status);
  const active = /^active now$/i.test(status.trim());

  return (
    <div
      data-testid="messenger-header"
      className="flex shrink-0 items-center gap-1 border-b px-1"
      style={{ height: "var(--messenger-header-height)", borderColor: "var(--messenger-hairline)" }}
    >
      <ChevronLeft className="size-7 shrink-0" strokeWidth={2.25} aria-hidden />
      <ParticipantAvatar size={36} />
      <div className="min-w-0 flex-1 pl-1.5">
        <p data-testid="preview-name" className="truncate text-[16px] leading-5 font-semibold">
          {name.trim() || " "}
        </p>
        <p
          data-testid="preview-status"
          className="truncate text-[12px] leading-4"
          style={{ color: active ? "var(--messenger-active)" : "var(--messenger-muted)" }}
        >
          {status}
        </p>
      </div>
      <div className="flex items-center pr-1 text-[#050505]">
        <span className="grid size-9 place-items-center" aria-hidden>
          <Phone className="size-[20px]" strokeWidth={1.75} />
        </span>
        <span className="grid size-9 place-items-center" aria-hidden>
          <Video className="size-[22px]" strokeWidth={1.75} />
        </span>
        <span className="grid size-9 place-items-center" aria-hidden>
          <Info className="size-[22px]" strokeWidth={1.75} />
        </span>
      </div>
    </div>
  );
}
