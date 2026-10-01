import { describe, expect, it, beforeEach } from "vitest";
import { createDemoProject, createMessage } from "@/lib/defaults";
import { useProjectStore } from "@/store/project-store";

describe("project store", () => {
  beforeEach(() => {
    useProjectStore.getState().replaceProject(createDemoProject());
  });

  it("updates the participant name", () => {
    useProjectStore.getState().setParticipant({ name: "Karim" });
    expect(useProjectStore.getState().participant.name).toBe("Karim");
  });

  it("adds, duplicates, reorders, and deletes messages", () => {
    const original = useProjectStore.getState().messages.length;
    const message = createMessage({
      sender: "self",
      type: "text",
      text: "Hello 😊",
      imageId: "shared-image",
    });
    useProjectStore.getState().addMessage(message);
    expect(useProjectStore.getState().messages.at(-1)?.text).toBe("Hello 😊");

    useProjectStore.getState().duplicateMessage(message.id);
    const copy = useProjectStore.getState().messages.at(-1);
    expect(copy?.id).not.toBe(message.id);
    expect(copy?.imageId).toBe("shared-image");
    expect(copy?.sender).toBe("self");

    const ids = useProjectStore.getState().messages.map((item) => item.id);
    useProjectStore.getState().reorderMessages(ids.length - 1, 0);
    expect(useProjectStore.getState().messages[0]?.id).toBe(copy?.id);

    useProjectStore.getState().deleteMessage(message.id);
    expect(useProjectStore.getState().messages.some((item) => item.id === message.id)).toBe(false);
    expect(useProjectStore.getState().messages.length).toBe(original + 1);
  });

  it("moves a message down", () => {
    const [first, second] = useProjectStore.getState().messages;
    if (!first || !second) throw new Error("Expected demo messages");
    useProjectStore.getState().moveMessage(first.id, 1);
    expect(useProjectStore.getState().messages[1]?.id).toBe(first.id);
    expect(useProjectStore.getState().messages[0]?.id).toBe(second.id);
  });
});
