import { z } from "zod";

export const PROJECT_VERSION = 1;

export const senderSchema = z.enum(["participant", "self"]);
export const messageTypeSchema = z.enum(["text", "image", "time"]);
export const deliveryStateSchema = z.enum(["none", "sent", "delivered", "seen"]);
export const zoomSchema = z.enum(["fit", "75", "100", "125"]);

export const messageSchema = z.object({
  id: z.string().min(1),
  sender: senderSchema,
  type: messageTypeSchema,
  text: z.string().optional(),
  imageId: z.string().min(1).optional(),
  timestamp: z.string().optional(),
  createdAt: z.number(),
});

export const participantSchema = z.object({
  name: z.string(),
  status: z.string(),
  avatarId: z.string().min(1).optional(),
});

export const phoneSettingsSchema = z.object({
  time: z.string(),
  batteryLevel: z.number().min(0).max(100),
  wifiEnabled: z.boolean(),
  signalLevel: z.number().int().min(0).max(4),
});

export const previewSettingsSchema = z.object({
  showTimestamps: z.boolean(),
  deliveryState: deliveryStateSchema,
  zoom: zoomSchema,
});

export const projectSchema = z.object({
  version: z.literal(PROJECT_VERSION),
  id: z.string().min(1),
  participant: participantSchema,
  phoneSettings: phoneSettingsSchema,
  messages: z.array(messageSchema),
  previewSettings: previewSettingsSchema,
  updatedAt: z.number(),
});

export const portableAssetSchema = z.object({
  id: z.string().min(1),
  mime: z.string().min(1),
  dataUrl: z.string().startsWith("data:image/"),
});

export const portableProjectSchema = projectSchema.extend({
  assets: z.array(portableAssetSchema).default([]),
});

export type Sender = z.infer<typeof senderSchema>;
export type MessageType = z.infer<typeof messageTypeSchema>;
export type DeliveryState = z.infer<typeof deliveryStateSchema>;
export type PreviewZoom = z.infer<typeof zoomSchema>;
export type ConversationMessage = z.infer<typeof messageSchema>;
export type Participant = z.infer<typeof participantSchema>;
export type PhoneSettings = z.infer<typeof phoneSettingsSchema>;
export type PreviewSettings = z.infer<typeof previewSettingsSchema>;
export type ProjectDocument = z.infer<typeof projectSchema>;
export type PortableAsset = z.infer<typeof portableAssetSchema>;
export type PortableProject = z.infer<typeof portableProjectSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .slice(0, 3)
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join(" ");
}
