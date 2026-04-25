"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

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
  // キャンペーン終了日時（ISO 8601、例: "2026-05-18T11:59:59+09:00"）
  // ビルド時に親コンポーネントの判定でレンダリング済みでも、
  // hydration 時に再判定して期限切れなら非表示にする（最大24時間のデプロイ遅延ガード）
  endDate?: string;
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
  endDate,
}: CampaignBannerProps) {
  // SSR/SSG 時は false（バナー表示）、hydration 後にクライアントで期限判定
  // useSyncExternalStore は SSR スナップショット（第3引数）と
  // クライアントスナップショット（第2引数）を分離できるため、
  // useEffect + setState のような cascading render を起こさない
  const isExpired = useSyncExternalStore(
    subscribe,
    () => {
      if (!endDate) return false;
      const end = new Date(endDate).getTime();
      return Number.isFinite(end) && Date.now() > end;
    },
    () => false,
  );

  const handleClick = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, {
        ...extraEventParams,
        transport_type: "beacon",
      });
    }
  };

  if (isExpired) return null;

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
