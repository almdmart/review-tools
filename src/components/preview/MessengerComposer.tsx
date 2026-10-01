import { Camera, Image as ImageIcon, Mic, Plus, Smile, ThumbsUp } from "lucide-react";

export function MessengerComposer() {
  return (
    <div
      data-testid="messenger-composer"
      className="flex shrink-0 items-end gap-2 border-t bg-white px-2.5 pt-1.5 pb-3"
      style={{ borderColor: "var(--messenger-hairline)", minHeight: "var(--composer-height)" }}
    >
      <span
        aria-hidden
        className="mb-0.5 grid size-8 shrink-0 place-items-center rounded-full text-white"
        style={{ background: "var(--messenger-blue)" }}
      >
        <Plus className="size-[18px]" strokeWidth={2.4} />
      </span>
      <div
        className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full px-2.5"
        style={{ background: "var(--messenger-field)" }}
      >
        <Camera className="size-[18px] shrink-0 text-[#65676B]" strokeWidth={1.8} aria-hidden />
        <ImageIcon className="size-[18px] shrink-0 text-[#65676B]" strokeWidth={1.8} aria-hidden />
        <Mic className="size-[18px] shrink-0 text-[#65676B]" strokeWidth={1.8} aria-hidden />
        <span className="min-w-0 flex-1 text-[15px] text-[#8a8d91]">Aa</span>
        <Smile className="size-[18px] shrink-0 text-[#65676B]" strokeWidth={1.8} aria-hidden />
        <ThumbsUp className="size-[18px] shrink-0" strokeWidth={1.8} style={{ color: "var(--messenger-blue)" }} aria-hidden />
      </div>
    </div>
  );
}
