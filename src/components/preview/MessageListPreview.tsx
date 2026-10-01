/* eslint-disable @next/next/no-img-element -- local blob previews are not next/image sources */
"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useAssetUrl } from "@/components/project/use-asset-url";
import { ConversationStart } from "@/components/preview/ConversationStart";
import { ParticipantAvatar } from "@/components/preview/ParticipantAvatar";
import { bubbleRadius, buildThread, lastOutgoingMessageId } from "@/lib/grouping";
import type { BubblePosition, BubbleItem } from "@/lib/grouping";
import type { ConversationMessage, Sender } from "@/lib/schema";
import { useProjectStore } from "@/store/project-store";
import { cn } from "cn";

function TextBubble({
  message,
  sender,
  position,
}: {
  message: ConversationMessage;
  sender: Sender;
  position: BubblePosition;
}) {
  const outgoing = sender === "self";
  return (
    <div
      data-testid="bubble"
      data-sender={sender}
      data-position={position}
      data-message-id={message.id}
      className="w-fit max-w-[var(--bubble-max-width)] px-3 py-[7px] text-[length:var(--bubble-font-size)] leading-[var(--bubble-line-height)] break-words whitespace-pre-wrap"
      style={{
        borderRadius: bubbleRadius(sender, position),
        background: outgoing ? "var(--messenger-blue)" : "var(--messenger-incoming)",
        color: outgoing ? "#ffffff" : "var(--messenger-text)",
      }}
    >
      {message.text || "\u00a0"}
    </div>
  );
}

function ImageBubble({
  message,
  sender,
  position,
}: {
  message: ConversationMessage;
  sender: Sender;
  position: BubblePosition;
}) {
  const url = useAssetUrl(message.imageId);
  const radius = bubbleRadius(sender, position);
  if (!url) {
    return (
      <div
        data-testid="image-bubble"
        data-sender={sender}
        data-message-id={message.id}
        className="grid h-28 w-40 place-items-center text-xs"
        style={{ borderRadius: radius, background: "var(--messenger-incoming)", color: "var(--messenger-muted)" }}
      >
        Image
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      data-testid="image-bubble"
      data-sender={sender}
      data-message-id={message.id}
      className="block h-auto max-h-[360px] w-auto max-w-[240px] object-contain"
      style={{ borderRadius: radius }}
    />
  );
}

function BubbleBlock({ bubble, sender }: { bubble: BubbleItem; sender: Sender }) {
  const showTimestamps = useProjectStore((state) => state.previewSettings.showTimestamps);
  const outgoing = sender === "self";
  return (
    <div className={cn("flex flex-col", outgoing && "items-end")}>
      {bubble.message.type === "image" ? (
        <ImageBubble message={bubble.message} sender={sender} position={bubble.position} />
      ) : (
        <TextBubble message={bubble.message} sender={sender} position={bubble.position} />
      )}
      {showTimestamps && bubble.message.timestamp ? (
        <p className="mt-0.5 px-1 text-[11px] leading-4" style={{ color: "var(--messenger-muted)" }}>
          {bubble.message.timestamp}
        </p>
      ) : null}
    </div>
  );
}

function DeliveryMark({ messageId }: { messageId: string }) {
  const delivery = useProjectStore((state) => state.previewSettings.deliveryState);
  const lastId = useProjectStore((state) => lastOutgoingMessageId(state.messages));
  if (delivery === "none" || messageId !== lastId) return null;
  if (delivery === "seen") {
    return (
      <div data-testid="seen-indicator" className="mt-1 flex justify-end">
        <ParticipantAvatar size={16} />
      </div>
    );
  }
  return (
    <p data-testid="delivery-label" className="mt-0.5 pr-0.5 text-[11px]" style={{ color: "var(--messenger-muted)" }}>
      {delivery === "sent" ? "Sent" : "Delivered"}
    </p>
  );
}

export function MessageListPreview() {
  const messages = useProjectStore((state) => state.messages);
  const thread = useMemo(() => buildThread(messages), [messages]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  useLayoutEffect(() => {
    const element = scrollerRef.current;
    if (!element || !stickToBottom.current) return;
    element.scrollTop = element.scrollHeight;
  }, [messages]);

  useLayoutEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;
    const onLoad = () => {
      if (stickToBottom.current) element.scrollTop = element.scrollHeight;
    };
    element.addEventListener("load", onLoad, true);
    return () => element.removeEventListener("load", onLoad, true);
  }, []);

  return (
    <div
      ref={scrollerRef}
      data-testid="preview-thread"
      className="messenger-scroll min-h-0 flex-1 overflow-y-auto"
      onScroll={(event) => {
        const element = event.currentTarget;
        stickToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 72;
      }}
    >
      <div className={cn("flex min-h-full flex-col px-2.5 pt-1 pb-2", messages.length === 0 && "h-full")}>
        <ConversationStart large={messages.length === 0} />
        <div className="mt-2 flex flex-col gap-2">
          {thread.map((item) => {
            if (item.kind === "time") {
              return (
                <p
                  key={item.message.id}
                  data-testid="time-separator"
                  className="py-1 text-center text-[12px] font-semibold"
                  style={{ color: "var(--messenger-muted)" }}
                >
                  {item.message.text}
                </p>
              );
            }
            const outgoing = item.sender === "self";
            const tailId = item.bubbles.at(-1)?.message.id;
            return (
              <div key={item.bubbles[0]?.message.id} className={cn("flex items-end", outgoing && "justify-end")}>
                {outgoing ? null : (
                  <div className="mr-1.5 w-7 shrink-0">
                    <ParticipantAvatar size={28} />
                  </div>
                )}
                <div className={cn("flex min-w-0 flex-col gap-0.5", outgoing && "items-end")}>
                  {item.bubbles.map((bubble) => (
                    <BubbleBlock key={bubble.message.id} bubble={bubble} sender={item.sender} />
                  ))}
                  {tailId ? <DeliveryMark messageId={tailId} /> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
