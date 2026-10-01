"use client";

import { ChevronDown } from "lucide-react";
import { EditorSection } from "@/components/common/EditorSection";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useProjectStore } from "@/store/project-store";

function sliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] ?? 0 : value;
}

export function PhoneSettings() {
  const phone = useProjectStore((state) => state.phoneSettings);
  const setPhoneSettings = useProjectStore((state) => state.setPhoneSettings);

  return (
    <EditorSection title="Mobile status bar">
      <Collapsible>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-background px-2.5 py-2 text-left text-sm font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          Advanced
          <ChevronDown className="size-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="grid gap-3 pt-3">
          <div className="grid gap-1.5">
            <Label htmlFor="phone-time">Time</Label>
            <Input
              id="phone-time"
              data-testid="phone-time"
              value={phone.time}
              onChange={(event) => setPhoneSettings({ time: event.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="signal-level">Cellular signal</Label>
              <span className="text-xs text-muted-foreground">{phone.signalLevel}/4</span>
            </div>
            <Slider
              id="signal-level"
              min={0}
              max={4}
              step={1}
              value={[phone.signalLevel]}
              onValueChange={(value) =>
                setPhoneSettings({ signalLevel: sliderValue(value) })
              }
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="wifi-enabled">Wi-Fi</Label>
            <Switch
              id="wifi-enabled"
              checked={phone.wifiEnabled}
              onCheckedChange={(checked) => setPhoneSettings({ wifiEnabled: checked })}
            />
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="battery-level">Battery</Label>
              <span className="text-xs text-muted-foreground">{Math.round(phone.batteryLevel)}%</span>
            </div>
            <Slider
              id="battery-level"
              min={0}
              max={100}
              step={1}
              value={[phone.batteryLevel]}
              onValueChange={(value) =>
                setPhoneSettings({ batteryLevel: sliderValue(value) })
              }
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </EditorSection>
  );
}
