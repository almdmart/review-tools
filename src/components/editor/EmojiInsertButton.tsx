"use client";

import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

export function EmojiInsertButton({ onSelect }: { onSelect: (emoji: string) => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 8, left: 8 });

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const width = 320;
      const height = 380;
      setPosition({
        left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
        top: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - height - 8)),
      });
    }
    setOpen((value) => !value);
  }

  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Insert emoji"
        aria-expanded={open}
        onClick={toggle}
      >
        <Smile />
      </Button>
      {open
        ? createPortal(
            <div ref={panelRef} className="fixed z-50 shadow-lg" style={position}>
              <EmojiPicker
                width={320}
                height={360}
                lazyLoadEmojis
                onEmojiClick={(emoji: EmojiClickData) => {
                  onSelect(emoji.emoji);
                  setOpen(false);
                }}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
