"use client";

import { useState, useMemo, useEffect } from "react";
import { WorkCard } from "@/components/work-card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, X, JapaneseYen } from "lucide-react";
import type { Work } from "@/lib/types";

interface SaleFilterSortProps {
  works: Work[];
}

type SortOption =
  | "discount"
  | "price_asc"
  | "deadline"
  | "new"
  | "rating"
  | "review_count";
type GenreFilter = "all" | "voice" | "game";
type PriceFilter = "all" | "100" | "300" | "500" | "1000" | "2000";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "discount", label: "割引率順" },
  { value: "price_asc", label: "価格が安い順" },
  { value: "deadline", label: "終了が近い順" },
  { value: "rating", label: "評価順" },
  { value: "review_count", label: "レビュー数順" },
  { value: "new", label: "新着順" },
];

const genreFilters: { value: GenreFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "voice", label: "ボイス・ASMR" },
  { value: "game", label: "ゲーム" },
];

const priceFilters: { value: PriceFilter; label: string }[] = [
  { value: "all", label: "指定なし" },
  { value: "100", label: "〜100円" },
  { value: "300", label: "〜300円" },
  { value: "500", label: "〜500円" },
  { value: "1000", label: "〜1,000円" },
  { value: "2000", label: "〜2,000円" },
];

function getCheapestPrice(work: Work): number {
  const dlsitePrice =
    work.priceDlsite && work.discountRateDlsite
      ? Math.round(work.priceDlsite * (1 - work.discountRateDlsite / 100))
      : work.priceDlsite || Infinity;
  const fanzaPrice =
    work.priceFanza && work.discountRateFanza
      ? Math.round(work.priceFanza * (1 - work.discountRateFanza / 100))
      : work.priceFanza || Infinity;
  return Math.min(dlsitePrice, fanzaPrice);
}

function getEarliestEndDate(work: Work): number {
  const dates = [work.saleEndDateDlsite, work.saleEndDateFanza]
    .filter(Boolean)
    .map((d) => new Date(d!).getTime());
  return dates.length > 0 ? Math.min(...dates) : Infinity;
}

export function SaleFilterSort({ works }: SaleFilterSortProps) {
  const [sort, setSort] = useState<SortOption>("discount");
  const [genre, setGenre] = useState<GenreFilter>("all");
  const [maxPrice, setMaxPrice] = useState<PriceFilter>("all");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);

  // フィルター変更時にリセット
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on filter change
  useEffect(() => {
    setDisplayCount(50);
  }, [sort, genre, maxPrice]);

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sort)?.label || "割引率順";
  const currentPriceLabel =
    priceFilters.find((opt) => opt.value === maxPrice)?.label || "指定なし";

  const filteredAndSortedWorks = useMemo(() => {
    let result = works;

    // ジャンルフィルター
    if (genre === "voice") {
      result = result.filter(
        (w) => w.category === "ASMR" || w.category === "音声作品",
      );
    } else if (genre === "game") {
      result = result.filter((w) => w.category === "ゲーム");
    }

    // 価格フィルター
    if (maxPrice !== "all") {
      const limit = parseInt(maxPrice, 10);
      result = result.filter((w) => getCheapestPrice(w) <= limit);
    }

    // ソート
    return [...result].sort((a, b) => {
      switch (sort) {
        case "discount":
          return (b.maxDiscountRate || 0) - (a.maxDiscountRate || 0);
        case "price_asc":
          return getCheapestPrice(a) - getCheapestPrice(b);
        case "deadline":
          return getEarliestEndDate(a) - getEarliestEndDate(b);
        case "rating": {
          const ratingA = a.ratingDlsite || a.ratingFanza || 0;
          const ratingB = b.ratingDlsite || b.ratingFanza || 0;
          return ratingB - ratingA;
        }
        case "review_count": {
          const reviewA =
            (a.reviewCountDlsite || 0) + (a.reviewCountFanza || 0);
          const reviewB =
            (b.reviewCountDlsite || 0) + (b.reviewCountFanza || 0);
          return reviewB - reviewA;
        }
        case "new":
          return (
            new Date(b.releaseDate || 0).getTime() -
            new Date(a.releaseDate || 0).getTime()
          );
        default:
          return 0;
      }
    });
  }, [works, sort, genre, maxPrice]);

  return (
    <div>
      {/* フィルター・ソートバー */}
      <div className="mb-4 space-y-3">
        {/* 1段目: ジャンル */}
        <div className="flex flex-wrap gap-2">
          {genreFilters.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setGenre(option.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                genre === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 2段目: 価格 + ソート */}
        <div className="flex items-center justify-between gap-2">
          {/* 価格フィルター（モーダルトリガー） */}
          <button
            type="button"
            onClick={() => setIsPriceModalOpen(true)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              maxPrice !== "all"
                ? "bg-emerald-600 text-white"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            <JapaneseYen className="h-3 w-3" />
            <span>{maxPrice === "all" ? "価格" : currentPriceLabel}</span>
          </button>

          {/* ソート（モーダルトリガー） */}
          <button
            type="button"
            onClick={() => setIsSortModalOpen(true)}
            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
          >
            <span>{currentSortLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* 件数表示 */}
      <p className="mb-3 text-xs text-muted-foreground">
        {filteredAndSortedWorks.length}件
        {genre !== "all" && (
          <span className="ml-1">
            （{genreFilters.find((g) => g.value === genre)?.label}）
          </span>
        )}
        {maxPrice !== "all" && (
          <span className="ml-1">（{currentPriceLabel}）</span>
        )}
      </p>

      {/* 作品一覧 */}
      {filteredAndSortedWorks.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {filteredAndSortedWorks.slice(0, displayCount).map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
          {displayCount < filteredAndSortedWorks.length && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDisplayCount((prev) => Math.min(prev + 50, filteredAndSortedWorks.length))}
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                もっと見る（残り{filteredAndSortedWorks.length - displayCount}件）
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="py-8 text-center text-muted-foreground">
          該当する作品がありません
        </p>
      )}

      {/* ソートモーダル */}
      {isSortModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setIsSortModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-background p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">並び替え</h2>
              <button
                type="button"
                onClick={() => setIsSortModalOpen(false)}
                className="rounded-full p-2 hover:bg-secondary"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSort(opt.value);
                    setIsSortModalOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors ${
                    sort === opt.value
                      ? "bg-sale/10 text-sale"
                      : "hover:bg-secondary"
                  }`}
                >
                  <span className="text-base">{opt.label}</span>
                  {sort === opt.value && (
                    <Check className="h-5 w-5 text-sale" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 価格フィルターモーダル */}
      {isPriceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setIsPriceModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-background p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                価格で絞り込み
              </h2>
              <button
                type="button"
                onClick={() => setIsPriceModalOpen(false)}
                className="rounded-full p-2 hover:bg-secondary"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-1">
              {priceFilters.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setMaxPrice(opt.value);
                    setIsPriceModalOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors ${
                    maxPrice === opt.value
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "hover:bg-secondary"
                  }`}
                >
                  <span className="text-base">{opt.label}</span>
                  {maxPrice === opt.value && (
                    <Check className="h-5 w-5 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
