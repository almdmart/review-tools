import { createId } from "@/lib/ids";
import type {
  ConversationMessage,
  Participant,
  PhoneSettings,
  PreviewSettings,
  ProjectDocument,
  Sender,
} from "@/lib/schema";

export const DEMO_IMAGE_ID = "demo-landscape";

export function defaultParticipant(): Participant {
  return {
    name: "Rahim",
    status: "Active now",
  };
}

export function defaultPhoneSettings(): PhoneSettings {
  return {
    time: "9:41",
    batteryLevel: 84,
    wifiEnabled: true,
    signalLevel: 4,
  };
}

export function defaultPreviewSettings(): PreviewSettings {
  return {
    showTimestamps: false,
    deliveryState: "none",
    zoom: "fit",
  };
}

export function createMessage(
  partial: Partial<ConversationMessage> & Pick<ConversationMessage, "sender" | "type">,
): ConversationMessage {
  return {
    id: partial.id ?? createId(),
    sender: partial.sender,
    type: partial.type,
    text: partial.text,
    imageId: partial.imageId,
    timestamp: partial.timestamp,
    createdAt: partial.createdAt ?? Date.now(),
  };
}

export function createDemoProject(): ProjectDocument {
  const now = Date.now();
  const messages: ConversationMessage[] = [
    createMessage({
      sender: "participant",
      type: "text",
      text: "Hey!",
      timestamp: "7:58 PM",
      createdAt: now,
    }),
    createMessage({
      sender: "participant",
      type: "text",
      text: "দারুণ! তাহলে ৮টায় দেখা হবে?",
      timestamp: "7:58 PM",
      createdAt: now + 1,
    }),
    createMessage({
      sender: "self",
      type: "text",
      text: "Yes — just wrapping up 😊",
      timestamp: "7:59 PM",
      createdAt: now + 2,
    }),
    createMessage({
      sender: "participant",
      type: "time",
      text: "8:02 PM",
      createdAt: now + 3,
    }),
    createMessage({
      sender: "self",
      type: "text",
      text: "Sounds good. I'll send the place.",
      timestamp: "8:02 PM",
      createdAt: now + 4,
    }),
    createMessage({
      sender: "self",
      type: "image",
      imageId: DEMO_IMAGE_ID,
      text: "",
      createdAt: now + 5,
    }),
  ];

  return {
    version: 1,
    id: createId(),
    participant: defaultParticipant(),
    phoneSettings: defaultPhoneSettings(),
    messages,
    previewSettings: defaultPreviewSettings(),
    updatedAt: now,
  };
}

export function blankMessage(sender: Sender): ConversationMessage {
  return createMessage({ sender, type: "text", text: "" });
}
