import type { ConversationMessage, Sender } from "@/lib/schema";

export type BubblePosition = "single" | "first" | "middle" | "last";

export interface BubbleItem {
  message: ConversationMessage;
  position: BubblePosition;
}

export type ThreadItem =
  | { kind: "time"; message: ConversationMessage }
  | { kind: "group"; sender: Sender; bubbles: BubbleItem[] };

function positionFor(index: number, length: number): BubblePosition {
  if (length <= 1) return "single";
  if (index === 0) return "first";
  if (index === length - 1) return "last";
  return "middle";
}

export function buildThread(messages: ConversationMessage[]): ThreadItem[] {
  const items: ThreadItem[] = [];
  let current: Extract<ThreadItem, { kind: "group" }> | null = null;

  const flush = () => {
    if (!current) return;
    const length = current.bubbles.length;
    current.bubbles = current.bubbles.map((bubble, index) => ({
      ...bubble,
      position: positionFor(index, length),
    }));
    items.push(current);
    current = null;
  };

  for (const message of messages) {
    if (message.type === "time") {
      flush();
      items.push({ kind: "time", message });
      continue;
    }
    if (!current || current.sender !== message.sender) {
      flush();
      current = { kind: "group", sender: message.sender, bubbles: [] };
    }
    current.bubbles.push({ message, position: "single" });
  }

  flush();
  return items;
}

export function bubbleRadius(sender: Sender, position: BubblePosition): string {
  const round = "18px";
  const tight = "5px";
  if (sender === "self") {
    if (position === "single") return round;
    if (position === "first") return `${round} ${round} ${tight} ${round}`;
    if (position === "middle") return `${round} ${tight} ${tight} ${round}`;
    return `${round} ${tight} ${round} ${round}`;
  }
  if (position === "single") return round;
  if (position === "first") return `${round} ${round} ${round} ${tight}`;
  if (position === "middle") return `${tight} ${round} ${round} ${tight}`;
  return `${tight} ${round} ${round} ${round}`;
}

export function lastOutgoingMessageId(messages: ConversationMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.sender === "self" && message.type !== "time") return message.id;
  }
  return null;
}

export function senderLabel(sender: Sender, participantName: string): string {
  if (sender === "self") return "Me";
  const name = participantName.trim();
  return name || "Participant";
}
