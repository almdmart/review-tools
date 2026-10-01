"use client";

import { useEffect, useRef } from "react";
import { MessengerComposer } from "@/components/preview/MessengerComposer";
import { MessengerHeader } from "@/components/preview/MessengerHeader";
import { MessageListPreview } from "@/components/preview/MessageListPreview";
import { MobileStatusBar } from "@/components/preview/MobileStatusBar";
import { setPreviewNode } from "@/lib/preview-node";

export function MessengerPhonePreview() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPreviewNode(ref.current);
    return () => setPreviewNode(null);
  }, []);

  return (
    <div ref={ref} data-testid="preview-screen" className="messenger-screen">
      <MobileStatusBar />
      <MessengerHeader />
      <MessageListPreview />
      <MessengerComposer />
    </div>
  );
}
