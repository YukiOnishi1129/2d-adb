"use client";

import type { Work } from "@/lib/types";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Image, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface HorizontalScrollSectionProps {
  title: string;
  subtitle?: string;
  href: string;
  works: Work[];
  showRankBadge?: boolean;
  rankBadgeColor?: "gold" | "purple" | "orange" | "emerald";
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

function getTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "終了";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `残り${days}日`;
  return `残り${hours}時間`;
}

function getCheaperPrice(work: Work): {
  price: number;
  originalPrice: number;
  discountRate: number | null;
} | null {
  const dlsiteOriginal = work.priceDlsite;
  const fanzaOriginal = work.priceFanza;
  const dlsitePrice =
    work.priceDlsite && work.discountRateDlsite
      ? Math.round(work.priceDlsite * (1 - work.discountRateDlsite / 100))
      : work.priceDlsite;
  const fanzaPrice =
    work.priceFanza && work.discountRateFanza
      ? Math.round(work.priceFanza * (1 - work.discountRateFanza / 100))
      : work.priceFanza;

  if (dlsitePrice && fanzaPrice) {
    if (dlsitePrice <= fanzaPrice) {
      return {
        price: dlsitePrice,
        originalPrice: dlsiteOriginal!,
        discountRate: work.discountRateDlsite,
      };
    }
    return {
      price: fanzaPrice,
      originalPrice: fanzaOriginal!,
      discountRate: work.discountRateFanza,
    };
  }
  if (dlsitePrice && dlsiteOriginal)
    return {
      price: dlsitePrice,
      originalPrice: dlsiteOriginal,
      discountRate: work.discountRateDlsite,
    };
  if (fanzaPrice && fanzaOriginal)
    return {
      price: fanzaPrice,
      originalPrice: fanzaOriginal,
      discountRate: work.discountRateFanza,
    };
  return null;
}

function getCategoryLabel(category: string | null | undefined): string {
  if (!category) return "";
  switch (category) {
    case "ASMR":
    case "音声作品":
      return "ASMR";
    case "ゲーム":
      return "ゲーム";
    case "動画":
      return "動画";
    case "CG集":
      return "CG集";
    default:
      return category;
  }
}

function getRankBadgeStyles(rank: number, color: string) {
  // 1位〜3位は特別デザイン
  if (rank === 1) {
    return {
      bg: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600",
      text: "text-amber-900",
      size: "h-10 w-10 text-lg",
      shadow: "shadow-lg shadow-yellow-500/50",
    };
  }
  if (rank === 2) {
    return {
      bg: "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500",
      text: "text-gray-800",
      size: "h-9 w-9 text-base",
      shadow: "shadow-lg shadow-gray-400/50",
    };
  }
  if (rank === 3) {
    return {
      bg: "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700",
      text: "text-orange-900",
      size: "h-9 w-9 text-base",
      shadow: "shadow-lg shadow-orange-500/50",
    };
  }

  // 4位以降は色別
  const colorMap: Record<string, string> = {
    gold: "bg-amber-500",
    purple: "bg-primary",
    orange: "bg-orange-500",
    emerald: "bg-emerald-500",
  };

  return {
    bg: colorMap[color] || "bg-gray-500",
    text: "text-white",
    size: "h-7 w-7 text-sm",
    shadow: "",
  };
}

export function HorizontalScrollSection({
  title,
  subtitle,
  href,
  works,
  showRankBadge = false,
  rankBadgeColor = "gold",
}: HorizontalScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (works.length === 0) return null;

  return (
    <section className="mb-4">
      {/* ヘッダー */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent/80"
        >
          もっと見る
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 横スクロールエリア */}
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-6 flex gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory overscroll-x-contain"
      >
        {works.map((work, index) => {
          const cheaper = getCheaperPrice(work);
          const isOnSale = work.isOnSale;
          const cvNames = work.killerWords.cvNames || work.actors;
          const rankStyles = showRankBadge
            ? getRankBadgeStyles(index + 1, rankBadgeColor)
            : null;

          return (
            <Link
              key={work.id}
              href={`/works/${work.id}`}
              className="flex-shrink-0 snap-start"
              style={{ width: index < 3 && showRankBadge ? "200px" : "180px" }}
            >
              <Card className="group h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                {/* サムネイル */}
                <div className="relative aspect-[1.91/1] overflow-hidden bg-muted">
                  <img
                    src={
                      work.thumbnailUrl ||
                      "https://placehold.co/600x314/f4f4f5/71717a?text=No+Image"
                    }
                    alt={work.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* ランキングバッジ */}
                  {showRankBadge && rankStyles && (
                    <div
                      className={`absolute -left-1 -top-1 z-10 flex items-center justify-center rounded-full font-bold ${rankStyles.bg} ${rankStyles.text} ${rankStyles.size} ${rankStyles.shadow}`}
                    >
                      {index + 1}
                    </div>
                  )}

                  {/* セールバッジ */}
                  {isOnSale && work.maxDiscountRate && work.maxDiscountRate > 0 && (
                    <Badge
                      variant="sale"
                      className={`absolute ${showRankBadge ? "top-2 right-2" : "top-2 left-2"} text-xs font-bold`}
                    >
                      {work.maxDiscountRate}%OFF
                    </Badge>
                  )}

                  {/* カテゴリバッジ */}
                  {work.category && (
                    <Badge
                      variant="secondary"
                      className={`absolute ${isOnSale && work.maxDiscountRate ? (showRankBadge ? "top-8 right-2" : "top-8 left-2") : showRankBadge ? "top-2 right-2" : "top-2 left-2"} text-[9px]`}
                    >
                      {getCategoryLabel(work.category)}
                    </Badge>
                  )}

                  {/* スペックバッジ */}
                  {work.killerWords.durationMinutes && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                      <Clock className="h-3 w-3" />
                      {work.killerWords.durationMinutes}分
                    </div>
                  )}
                  {work.killerWords.cgCount &&
                    !work.killerWords.durationMinutes && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                        <Image className="h-3 w-3" />
                        {work.killerWords.cgCount}枚
                      </div>
                    )}
                </div>

                {/* 情報エリア */}
                <div className="p-2.5">
                  {/* CV名 */}
                  {cvNames && cvNames.length > 0 && (
                    <div className="mb-1 flex flex-wrap gap-1">
                      <Badge variant="cv" className="text-[9px] px-1.5 py-0">
                        {cvNames[0]}
                      </Badge>
                      {cvNames.length > 1 && (
                        <span className="text-[9px] text-muted-foreground">
                          +{cvNames.length - 1}
                        </span>
                      )}
                    </div>
                  )}

                  {/* タイトル */}
                  <h3 className="mb-1 line-clamp-2 text-xs font-medium leading-tight text-foreground">
                    {work.title}
                  </h3>

                  {/* 価格エリア */}
                  {cheaper && (
                    <div className="flex items-baseline gap-1.5">
                      {cheaper.discountRate && cheaper.discountRate > 0 && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          {formatPrice(cheaper.originalPrice)}
                        </span>
                      )}
                      <span
                        className={`text-sm font-bold ${isOnSale ? "text-red-500" : "text-foreground"}`}
                      >
                        {formatPrice(cheaper.price)}
                      </span>
                    </div>
                  )}

                  {/* セール残り時間 */}
                  {isOnSale &&
                    (work.saleEndDateDlsite || work.saleEndDateFanza) && (
                      <span className="text-[9px] font-medium text-orange-500">
                        {getTimeRemaining(
                          (work.saleEndDateDlsite || work.saleEndDateFanza)!,
                        )}
                      </span>
                    )}

                  {/* 評価 */}
                  {(work.ratingDlsite || work.ratingFanza) && (
                    <div className="mt-1 flex items-center gap-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const rating =
                            work.ratingDlsite || work.ratingFanza || 0;
                          const filled = star <= Math.round(rating);
                          return (
                            <svg
                              key={star}
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                            >
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                fill={filled ? "#f59e0b" : "#e5e7eb"}
                                stroke="#ea580c"
                                strokeWidth="0.5"
                              />
                            </svg>
                          );
                        })}
                      </div>
                      <span className="text-[9px] font-bold text-orange-500">
                        {(work.ratingDlsite || work.ratingFanza || 0).toFixed(
                          1,
                        )}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        ({work.reviewCountDlsite || work.reviewCountFanza || 0})
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}

        {/* もっと見るカード */}
        <Link
          href={href}
          className="flex-shrink-0 snap-start"
          style={{ width: "120px" }}
        >
          <Card className="flex h-full items-center justify-center bg-secondary/50 transition-all duration-200 hover:bg-secondary hover:shadow-lg">
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ChevronRight className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                もっと見る
              </span>
            </div>
          </Card>
        </Link>
      </div>
    </section>
  );
}
