/* eslint-disable @next/next/no-img-element -- local blob previews are not next/image sources */
"use client";

import { useAssetUrl } from "@/components/project/use-asset-url";
import { useProjectStore } from "@/store/project-store";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const letters = parts.map((part) => [...part][0] ?? "").join("");
  return letters.toUpperCase() || "?";
}

export function ParticipantAvatar({ size }: { size: number }) {
  const name = useProjectStore((state) => state.participant.name);
  const avatarId = useProjectStore((state) => state.participant.avatarId);
  const url = useAssetUrl(avatarId);
  const style = { width: size, height: size, fontSize: Math.max(10, size * 0.36) };

  if (url) {
    return <img src={url} alt="" style={style} className="shrink-0 rounded-full object-cover" />;
  }

  return (
    <span
      style={style}
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#d8dadf] font-semibold text-[#050505]"
    >
      {initials(name)}
    </span>
  );
}
