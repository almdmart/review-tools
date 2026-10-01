"use client";

import { useProjectStore } from "@/store/project-store";

function SignalIcon({ level }: { level: number }) {
  const heights = [4, 6, 8, 11];
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden>
      {heights.map((height, index) => (
        <rect
          key={height}
          x={index * 4.2}
          y={12 - height}
          width="3"
          height={height}
          rx="0.6"
          fill={index < level ? "#050505" : "rgba(5,5,5,0.25)"}
        />
      ))}
    </svg>
  );
}

function WifiIcon({ enabled }: { enabled: boolean }) {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
      <path
        d="M8 10.2a1.15 1.15 0 1 0 0.01 0z"
        fill={enabled ? "#050505" : "rgba(5,5,5,0.28)"}
      />
      <path
        d="M4.2 7.4a5.4 5.4 0 0 1 7.6 0"
        fill="none"
        stroke={enabled ? "#050505" : "rgba(5,5,5,0.28)"}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M1.6 4.8a9 9 0 0 1 12.8 0"
        fill="none"
        stroke={enabled ? "#050505" : "rgba(5,5,5,0.28)"}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {enabled ? null : (
        <path d="M2 1.5 L14 11" stroke="#050505" strokeWidth="1.3" strokeLinecap="round" />
      )}
    </svg>
  );
}

function BatteryIcon({ level }: { level: number }) {
  const clamped = Math.max(0, Math.min(100, level));
  const fill = (clamped / 100) * 18.2;
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden>
      <rect x="0.6" y="0.6" width="22.2" height="11.8" rx="3" fill="none" stroke="#050505" strokeWidth="1" />
      <rect x="23.6" y="4" width="2.2" height="5" rx="0.8" fill="#050505" opacity="0.45" />
      <rect
        x="2"
        y="2"
        width={Math.max(0, fill)}
        height="9"
        rx="1.4"
        fill={clamped <= 20 ? "#ff3b30" : "#050505"}
      />
    </svg>
  );
}

export function MobileStatusBar() {
  const phone = useProjectStore((state) => state.phoneSettings);
  return (
    <div
      data-testid="status-bar"
      className="flex shrink-0 items-center justify-between px-5"
      style={{ height: "var(--status-bar-height)" }}
    >
      <span className="text-[15px] leading-none font-semibold tracking-tight">{phone.time}</span>
      <div className="flex items-center gap-1.5">
        <SignalIcon level={phone.signalLevel} />
        <WifiIcon enabled={phone.wifiEnabled} />
        <span className="text-[12px] font-semibold tabular-nums">{Math.round(phone.batteryLevel)}</span>
        <BatteryIcon level={phone.batteryLevel} />
      </div>
    </div>
  );
}
