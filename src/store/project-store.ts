import { create } from "zustand";
import { createDemoProject, createMessage } from "@/lib/defaults";
import type {
  ConversationMessage,
  Participant,
  PhoneSettings,
  PreviewSettings,
  ProjectDocument,
  Sender,
} from "@/lib/schema";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ProjectState {
  hydrated: boolean;
  saveStatus: SaveStatus;
  projectId: string;
  participant: Participant;
  phoneSettings: PhoneSettings;
  messages: ConversationMessage[];
  previewSettings: PreviewSettings;
  updatedAt: number;
  activeMessageId: string | null;
  setParticipant: (patch: Partial<Participant>) => void;
  setPhoneSettings: (patch: Partial<PhoneSettings>) => void;
  setPreviewSettings: (patch: Partial<PreviewSettings>) => void;
  addMessage: (message: ConversationMessage) => void;
  addMessages: (messages: ConversationMessage[]) => void;
  updateMessage: (id: string, patch: Partial<ConversationMessage>) => void;
  duplicateMessage: (id: string) => void;
  deleteMessage: (id: string) => void;
  moveMessage: (id: string, direction: -1 | 1) => void;
  reorderMessages: (fromIndex: number, toIndex: number) => void;
  replaceProject: (project: ProjectDocument) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setHydrated: (hydrated: boolean) => void;
  touch: () => void;
}

const demo = createDemoProject();

export const useProjectStore = create<ProjectState>((set) => ({
  hydrated: false,
  saveStatus: "idle",
  projectId: demo.id,
  participant: demo.participant,
  phoneSettings: demo.phoneSettings,
  messages: demo.messages,
  previewSettings: demo.previewSettings,
  updatedAt: demo.updatedAt,
  activeMessageId: null,
  setParticipant: (patch) =>
    set((state) => ({ participant: { ...state.participant, ...patch }, updatedAt: Date.now() })),
  setPhoneSettings: (patch) =>
    set((state) => ({ phoneSettings: { ...state.phoneSettings, ...patch }, updatedAt: Date.now() })),
  setPreviewSettings: (patch) =>
    set((state) => ({
      previewSettings: { ...state.previewSettings, ...patch },
      updatedAt: Date.now(),
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      activeMessageId: message.id,
      updatedAt: Date.now(),
    })),
  addMessages: (messages) =>
    set((state) => ({
      messages: [...state.messages, ...messages],
      activeMessageId: messages.at(-1)?.id ?? state.activeMessageId,
      updatedAt: Date.now(),
    })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, ...patch, id: message.id } : message,
      ),
      updatedAt: Date.now(),
    })),
  duplicateMessage: (id) =>
    set((state) => {
      const index = state.messages.findIndex((message) => message.id === id);
      if (index < 0) return state;
      const source = state.messages[index];
      if (!source) return state;
      const copy = createMessage({
        sender: source.sender,
        type: source.type,
        text: source.text,
        imageId: source.imageId,
        timestamp: source.timestamp,
      });
      const messages = [...state.messages];
      messages.splice(index + 1, 0, copy);
      return { messages, activeMessageId: copy.id, updatedAt: Date.now() };
    }),
  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
      activeMessageId: state.activeMessageId === id ? null : state.activeMessageId,
      updatedAt: Date.now(),
    })),
  moveMessage: (id, direction) =>
    set((state) => {
      const index = state.messages.findIndex((message) => message.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= state.messages.length) return state;
      const messages = [...state.messages];
      const [item] = messages.splice(index, 1);
      if (!item) return state;
      messages.splice(nextIndex, 0, item);
      return { messages, updatedAt: Date.now() };
    }),
  reorderMessages: (fromIndex, toIndex) =>
    set((state) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.messages.length ||
        toIndex >= state.messages.length
      ) {
        return state;
      }
      const messages = [...state.messages];
      const [item] = messages.splice(fromIndex, 1);
      if (!item) return state;
      messages.splice(toIndex, 0, item);
      return { messages, updatedAt: Date.now() };
    }),
  replaceProject: (project) =>
    set({
      projectId: project.id,
      participant: project.participant,
      phoneSettings: project.phoneSettings,
      messages: project.messages,
      previewSettings: project.previewSettings,
      updatedAt: Date.now(),
      hydrated: true,
      activeMessageId: null,
    }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setHydrated: (hydrated) => set({ hydrated }),
  touch: () => set({ updatedAt: Date.now() }),
}));

export function selectProjectDocument(
  state: Pick<
    ProjectState,
    "projectId" | "participant" | "phoneSettings" | "messages" | "previewSettings" | "updatedAt"
  >,
): ProjectDocument {
  return {
    version: 1,
    id: state.projectId,
    participant: state.participant,
    phoneSettings: state.phoneSettings,
    messages: state.messages,
    previewSettings: state.previewSettings,
    updatedAt: state.updatedAt,
  };
}

export function referencedAssetIds(state: Pick<ProjectState, "participant" | "messages">): string[] {
  const ids = new Set<string>();
  if (state.participant.avatarId) ids.add(state.participant.avatarId);
  for (const message of state.messages) {
    if (message.imageId) ids.add(message.imageId);
  }
  return [...ids];
}

export function addQuickMessage(sender: Sender, count = 1) {
  const messages = Array.from({ length: count }, () => createMessage({ sender, type: "text", text: "" }));
  if (count === 1 && messages[0]) useProjectStore.getState().addMessage(messages[0]);
  else useProjectStore.getState().addMessages(messages);
}
