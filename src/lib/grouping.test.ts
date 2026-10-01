import { describe, expect, it } from "vitest";
import { createMessage } from "@/lib/defaults";
import { bubbleRadius, buildThread, lastOutgoingMessageId } from "@/lib/grouping";

describe("buildThread", () => {
  it("groups consecutive messages from the same sender and splits on time separators", () => {
    const messages = [
      createMessage({ id: "a", sender: "participant", type: "text", text: "Hi" }),
      createMessage({ id: "b", sender: "participant", type: "text", text: "There" }),
      createMessage({ id: "c", sender: "participant", type: "time", text: "10:42 PM" }),
      createMessage({ id: "d", sender: "self", type: "text", text: "Hey" }),
    ];
    const thread = buildThread(messages);
    expect(thread.map((item) => item.kind)).toEqual(["group", "time", "group"]);
    const first = thread[0];
    expect(first?.kind).toBe("group");
    if (first?.kind === "group") {
      expect(first.bubbles.map((bubble) => bubble.position)).toEqual(["first", "last"]);
    }
    expect(thread[2]?.kind).toBe("group");
    if (thread[2]?.kind === "group") {
      expect(thread[2].bubbles[0]?.position).toBe("single");
    }
  });

  it("uses messenger radii for grouped bubbles", () => {
    expect(bubbleRadius("self", "single")).toBe("18px");
    expect(bubbleRadius("self", "first")).toBe("18px 18px 5px 18px");
    expect(bubbleRadius("participant", "last")).toBe("5px 18px 18px 18px");
    expect(bubbleRadius("participant", "middle")).toBe("5px 18px 18px 5px");
  });

  it("finds the latest outgoing message", () => {
    const messages = [
      createMessage({ id: "a", sender: "self", type: "text", text: "One" }),
      createMessage({ id: "b", sender: "participant", type: "text", text: "Two" }),
      createMessage({ id: "c", sender: "self", type: "image" }),
      createMessage({ id: "d", sender: "self", type: "time", text: "9:00" }),
    ];
    expect(lastOutgoingMessageId(messages)).toBe("c");
  });
});
