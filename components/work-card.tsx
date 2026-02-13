"use client";

import { memo } from "react";
import type { Work } from "@/lib/types";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Image, Gamepad2 } from "lucide-react";

interface WorkCardProps {
  work: Work;
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

function getCheaperPlatform(work: Work): {
  platform: string;
  price: number;
  originalPrice: number;
  discountRate: number | null;
} | null {
  // セール価格を計算
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
        platform: "DLsite",
        price: dlsitePrice,
        originalPrice: dlsiteOriginal!,
        discountRate: work.discountRateDlsite,
      };
    }
    return {
      platform: "FANZA",
      price: fanzaPrice,
      originalPrice: fanzaOriginal!,
      discountRate: work.discountRateFanza,
    };
  }
  if (dlsitePrice && dlsiteOriginal)
    return {
      platform: "DLsite",
      price: dlsitePrice,
      originalPrice: dlsiteOriginal,
      discountRate: work.discountRateDlsite,
    };
  if (fanzaPrice && fanzaOriginal)
    return {
      platform: "FANZA",
      price: fanzaPrice,
      originalPrice: fanzaOriginal,
      discountRate: work.discountRateFanza,
    };
  return null;
}

function getUnitPrice(work: Work): string | null {
  const { killerWords, genre, category } = work;
  const cheaper = getCheaperPlatform(work);
  if (!cheaper) return null;

  // 音声作品: 分単価（genreを優先）
  if (isASMRByGenre(genre, category) && killerWords.durationMinutes) {
    const perMinute = Math.round(cheaper.price / killerWords.durationMinutes);
    return `${perMinute}円/分`;
  }

  // ゲーム: CG単価（genreを優先）
  if (isGameByGenre(genre, category) && killerWords.cgCount) {
    const perCg = Math.round(cheaper.price / killerWords.cgCount);
    return `${perCg}円/枚`;
  }

  return null;
}

// genreを優先してカテゴリラベルを判定
function getCategoryLabel(genre: string | null | undefined, category: string | null | undefined): string {
  // genreを優先（より正確）
  if (genre) {
    if (genre.includes("音声")) return "ASMR";
    if (genre.includes("ゲーム")) return "ゲーム";
    if (genre.includes("動画")) return "動画";
    if (genre.includes("CG")) return "CG集";
  }
  // genreがない場合はcategoryにフォールバック
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

// genreからASMRかどうか判定
function isASMRByGenre(genre: string | null | undefined, category: string | null | undefined): boolean {
  // genreがある場合はgenreを優先
  if (genre) {
    return genre.includes("音声");
  }
  // genreがない場合のみcategoryにフォールバック
  return category === "ASMR" || category === "音声作品";
}

// genreからゲームかどうか判定
function isGameByGenre(genre: string | null | undefined, category: string | null | undefined): boolean {
  // genreがある場合はgenreを優先
  if (genre) {
    return genre.includes("ゲーム");
  }
  // genreがない場合のみcategoryにフォールバック
  return category === "ゲーム";
}

function getSpecBadge(work: Work): { icon: typeof Clock; text: string } | null {
  const { killerWords, genre, category } = work;

  // 音声・ASMR: 収録時間（genreを優先）
  if (isASMRByGenre(genre, category) && killerWords.durationMinutes) {
    return { icon: Clock, text: `${killerWords.durationMinutes}分` };
  }

  // ゲーム: CG枚数（genreを優先）
  if (isGameByGenre(genre, category) && killerWords.cgCount) {
    return { icon: Image, text: `${killerWords.cgCount}枚` };
  }

  // ゲーム: プレイ時間（genreを優先）
  if (isGameByGenre(genre, category) && killerWords.playTimeHours) {
    return { icon: Gamepad2, text: `${killerWords.playTimeHours}h` };
  }

  return null;
}

export const WorkCard = memo(function WorkCard({ work }: WorkCardProps) {
  const cheaper = getCheaperPlatform(work);
  const isOnSale = work.isOnSale;
  const unitPrice = getUnitPrice(work);
  const specBadge = getSpecBadge(work);
  const cvNames = work.killerWords.cvNames || work.actors;

  return (
    <Link href={`/works/${work.id}`}>
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
        {/* サムネイル - 横長1.91:1 */}
        <div className="relative aspect-[1.91/1] overflow-hidden bg-muted">
          <img
            src={
              work.thumbnailUrl ||
              "https://placehold.co/600x314/f4f4f5/71717a?text=No+Image"
            }
            alt={work.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/600x314/f4f4f5/71717a?text=No+Image";
            }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* セールバッジ */}
          {isOnSale && work.maxDiscountRate && work.maxDiscountRate > 0 && (
            <Badge variant="sale" className="absolute top-2 left-2">
              {work.maxDiscountRate}%OFF
            </Badge>
          )}
          {/* カテゴリバッジ */}
          {work.category && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 text-[10px]"
            >
              {getCategoryLabel(work.genre, work.category)}
            </Badge>
          )}
          {/* 高評価・人気バッジ（左下） */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {(work.ratingDlsite && work.ratingDlsite >= 4.5) || (work.ratingFanza && work.ratingFanza >= 4.5) ? (
              <div className="flex items-center gap-0.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                ★ 高評価
              </div>
            ) : null}
            {(work.reviewCountDlsite && work.reviewCountDlsite >= 50) || (work.reviewCountFanza && work.reviewCountFanza >= 50) ? (
              <div className="flex items-center gap-0.5 rounded bg-pink-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                人気
              </div>
            ) : null}
          </div>
          {/* スペックバッジ */}
          {specBadge && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
              <specBadge.icon className="h-3 w-3" />
              {specBadge.text}
            </div>
          )}
        </div>

        {/* 情報エリア */}
        <div className="p-3">
          {/* CV名 */}
          {cvNames && cvNames.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1">
              {cvNames.slice(0, 2).map((cv) => (
                <Badge key={cv} variant="cv" className="text-[10px]">
                  {cv}
                </Badge>
              ))}
              {cvNames.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{cvNames.length - 2}
                </span>
              )}
            </div>
          )}

          {/* タイトル */}
          <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-tight text-foreground">
            {work.title}
          </h3>

          {/* サークル名 */}
          <p className="mb-2 text-xs text-muted-foreground">
            {work.circleName}
          </p>

          {/* タグ */}
          <div className="mb-2 flex flex-wrap gap-1">
            {work.aiTags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="tag" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>

          {/* 価格エリア */}
          <div className="flex items-center justify-between">
            {cheaper && (
              <div className="flex items-baseline gap-1.5">
                {cheaper.discountRate && cheaper.discountRate > 0 && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(cheaper.originalPrice)}
                  </span>
                )}
                <span
                  className={`text-base font-bold ${isOnSale ? "text-red-500" : "text-foreground"}`}
                >
                  {formatPrice(cheaper.price)}
                </span>
                {unitPrice && (
                  <span className="text-[10px] text-muted-foreground">
                    ({unitPrice})
                  </span>
                )}
              </div>
            )}

            {/* セール残り時間（DLsite優先、なければFANZA） */}
            {isOnSale && (work.saleEndDateDlsite || work.saleEndDateFanza) && (
              <span className="text-[10px] font-medium text-orange-500">
                {getTimeRemaining(
                  (work.saleEndDateDlsite || work.saleEndDateFanza)!,
                )}
              </span>
            )}
          </div>

          {/* 評価 */}
          {(work.ratingDlsite || work.ratingFanza) && (
            <div className="mt-2 flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                  const rating = work.ratingDlsite || work.ratingFanza || 0;
                  const filled = star <= Math.round(rating);
                  return (
                    <svg key={star} className="h-4 w-4" viewBox="0 0 20 20">
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
              <span className="text-xs font-bold text-orange-500">
                {(work.ratingDlsite || work.ratingFanza || 0).toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({work.reviewCountDlsite || work.reviewCountFanza || 0})
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
});
