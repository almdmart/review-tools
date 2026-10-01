"use client";

import { EditorSection } from "@/components/common/EditorSection";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { DeliveryState } from "@/lib/schema";
import { useProjectStore } from "@/store/project-store";

const deliveryOptions: { value: DeliveryState; label: string }[] = [
  { value: "none", label: "None" },
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "seen", label: "Seen" },
];

export function PreviewSettings() {
  const preview = useProjectStore((state) => state.previewSettings);
  const setPreviewSettings = useProjectStore((state) => state.setPreviewSettings);

  return (
    <EditorSection title="Preview options">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="show-timestamps">Show timestamps</Label>
        <Switch
          id="show-timestamps"
          data-testid="show-timestamps"
          checked={preview.showTimestamps}
          onCheckedChange={(checked) => setPreviewSettings({ showTimestamps: checked })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Last outgoing message</Label>
        <Select
          value={preview.deliveryState}
          items={Object.fromEntries(deliveryOptions.map((option) => [option.value, option.label]))}
          onValueChange={(value) => {
            if (value) setPreviewSettings({ deliveryState: value as DeliveryState });
          }}
        >
          <SelectTrigger aria-label="Delivery state" data-testid="delivery-state" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {deliveryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </EditorSection>
  );
}
