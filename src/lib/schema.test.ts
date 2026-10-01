import { describe, expect, it } from "vitest";
import { createDemoProject } from "@/lib/defaults";
import { formatZodError, portableProjectSchema } from "@/lib/schema";

describe("portableProjectSchema", () => {
  it("accepts a demo project with embedded assets", () => {
    const project = {
      ...createDemoProject(),
      assets: [
        {
          id: "demo-landscape",
          mime: "image/png",
          dataUrl: "data:image/png;base64,aaaa",
        },
      ],
    };
    const parsed = portableProjectSchema.safeParse(project);
    expect(parsed.success).toBe(true);
  });

  it("rejects an unknown sender", () => {
    const project = createDemoProject();
    project.messages[0] = { ...project.messages[0]!, sender: "other" as "self" };
    const parsed = portableProjectSchema.safeParse({ ...project, assets: [] });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(formatZodError(parsed.error)).toContain("sender");
    }
  });

  it("rejects assets that are not image data urls", () => {
    const parsed = portableProjectSchema.safeParse({
      ...createDemoProject(),
      assets: [{ id: "x", mime: "text/plain", dataUrl: "data:text/plain,hello" }],
    });
    expect(parsed.success).toBe(false);
  });
});
