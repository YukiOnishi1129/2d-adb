"use client";

declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

interface CampaignBannerProps {
  href: string;
  // GA4イベント名（例: "gw_campaign_banner_click", "doujin_festival_banner_click"）
  eventName: string;
  // バナーの背景グラデーション（Tailwindクラス）
  gradientClass: string;
  // バナーラベル
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  // 任意の追加イベントパラメータ
  extraEventParams?: Record<string, unknown>;
}

export function CampaignBanner({
  href,
  eventName,
  gradientClass,
  badge,
  title,
  description,
  ctaLabel,
  extraEventParams,
}: CampaignBannerProps) {
  const handleClick = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, {
        ...extraEventParams,
        transport_type: "beacon",
      });
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`mb-4 flex items-center justify-between gap-3 rounded-lg p-4 text-white shadow-lg transition-transform hover:scale-[1.01] ${gradientClass}`}
    >
      <div className="flex flex-col">
        <span className="text-xs font-bold opacity-90">{badge}</span>
        <span className="text-lg font-black tracking-wide md:text-xl">
          {title}
        </span>
        <span className="text-xs opacity-90">{description}</span>
      </div>
      <span className="shrink-0 rounded-full bg-white/20 px-3 py-1.5 text-sm font-bold backdrop-blur">
        {ctaLabel}
      </span>
    </a>
  );
}
