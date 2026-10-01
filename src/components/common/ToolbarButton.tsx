"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ToolbarButton({
  tooltip,
  children,
  ...props
}: ComponentProps<typeof Button> & { tooltip?: string }) {
  const button = <Button {...props}>{children}</Button>;
  if (!tooltip) return button;
  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
