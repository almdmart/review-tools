"use client";

import { useSyncExternalStore } from "react";
import { getAssetUrl, subscribeAssets } from "@/lib/assets";

export function useAssetUrl(id: string | undefined) {
  return useSyncExternalStore(
    subscribeAssets,
    () => getAssetUrl(id),
    () => undefined,
  );
}
