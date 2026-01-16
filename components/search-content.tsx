"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchResultCard } from "@/components/search-result-card";
import { FeaturedBanners } from "@/components/featured-banners";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/use-search";
import { Search, ChevronDown, Check, X, JapaneseYen } from "lucide-react";
import type {
  SortType,
  CategoryFilter,
  PlatformFilter,
  PriceFilter,
} from "@/lib/search";
import Link from "next/link";

interface SearchContentProps {
  bannerData?: {
    saleThumbnail?: string | null;
    saleMaxDiscountRate?: number | null;
    saleTargetDate?: string | null;
    mainWorkSaleEndDate?: string | null;
    recommendationThumbnail?: string | null;
    recommendationDate?: string | null;
  };
}

function SearchContentInner({ bannerData }: SearchContentProps) {
  const searchParams = useSearchParams();
  const {
    results,
    isLoading,
    query,
    setQuery,
    sortType,
    setSortType,
    category,
    setCategory,
    platform,
    setPlatform,
    onSaleOnly,
    setOnSaleOnly,
    maxPrice,
    setMaxPrice,
    resultCount,
  } = useSearch();

  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  // URLパラメータから初期値を取得
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
    }

    const platformParam = searchParams.get("platform");
    if (platformParam === "dlsite" || platformParam === "fanza") {
      setPlatform(platformParam);
    }

    const sortParam = searchParams.get("sort");
    if (
      sortParam === "rank" ||
      sortParam === "new" ||
      sortParam === "discount" ||
      sortParam === "price" ||
      sortParam === "cospa" ||
      sortParam === "rating"
    ) {
      setSortType(sortParam);
    }

    const genreParam = searchParams.get("genre");
    if (genreParam === "voice" || genreParam === "asmr") {
      setCategory("asmr");
    } else if (genreParam === "game") {
      setCategory("game");
    }

    const maxParam = searchParams.get("max");
    if (
      maxParam === "100" ||
      maxParam === "300" ||
      maxParam === "500" ||
      maxParam === "1000" ||
      maxParam === "2000"
    ) {
      setMaxPrice(maxParam);
    }
  }, [
    searchParams,
    setQuery,
    setPlatform,
    setSortType,
    setCategory,
    setMaxPrice,
  ]);

  const sortOptions: { value: SortType; label: string }[] = [
    { value: "new", label: "新着順" },
    { value: "rank", label: "ランキング順" },
    { value: "rating", label: "評価順" },
    { value: "discount", label: "割引率順" },
    { value: "price", label: "価格が安い順" },
    { value: "cospa", label: "コスパ順" },
  ];

  const categoryOptions: { value: CategoryFilter; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "asmr", label: "ASMR" },
    { value: "game", label: "ゲーム" },
  ];

  const platformOptions: { value: PlatformFilter; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "dlsite", label: "DLsite" },
    { value: "fanza", label: "FANZA" },
  ];

  const priceOptions: { value: PriceFilter; label: string }[] = [
    { value: "all", label: "指定なし" },
    { value: "100", label: "〜100円" },
    { value: "300", label: "〜300円" },
    { value: "500", label: "〜500円" },
    { value: "1000", label: "〜1,000円" },
    { value: "2000", label: "〜2,000円" },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortType)?.label || "新着順";
  const currentPriceLabel =
    priceOptions.find((opt) => opt.value === maxPrice)?.label || "指定なし";

  return (
    <>
      {/* 今日のセール特集 & 今日のおすすめバナー */}
      <FeaturedBanners
        saleThumbnail={bannerData?.saleThumbnail}
        saleMaxDiscountRate={bannerData?.saleMaxDiscountRate}
        saleTargetDate={bannerData?.saleTargetDate}
        mainWorkSaleEndDate={bannerData?.mainWorkSaleEndDate}
        recommendationThumbnail={bannerData?.recommendationThumbnail}
        recommendationDate={bannerData?.recommendationDate}
      />

      {/* 検索フォーム */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="タイトル、声優、サークル、タグで検索..."
            className="h-11 pl-10 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* フィルター・ソート */}
      <div className="mb-4 space-y-3">
        {/* カテゴリ + セール中トグル */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategory(opt.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* セール中のみ - トグルスイッチ */}
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              セール中
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={onSaleOnly}
              onClick={() => setOnSaleOnly(!onSaleOnly)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                onSaleOnly ? "bg-sale" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  onSaleOnly ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        </div>

        {/* プラットフォーム */}
        <div className="flex flex-wrap items-center gap-1.5">
          {platformOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPlatform(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                platform === opt.value
                  ? opt.value === "dlsite"
                    ? "bg-blue-600 text-white"
                    : opt.value === "fanza"
                      ? "bg-orange-500 text-white"
                      : "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 価格 + ソート */}
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

      {/* 検索結果件数 */}
      <p className="mb-3 text-xs text-muted-foreground">
        {query ? `「${query}」` : ""}
        {resultCount}件
        {maxPrice !== "all" && (
          <span className="ml-1">（{currentPriceLabel}）</span>
        )}
      </p>

      {/* 検索結果 */}
      {isLoading ? (
        <p className="text-muted-foreground">読み込み中...</p>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {results.map((item) => (
            <SearchResultCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {query
              ? `「${query}」に一致する作品が見つかりませんでした`
              : "検索条件に一致する作品がありません"}
          </p>
        </div>
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
                    setSortType(opt.value);
                    setIsSortModalOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors ${
                    sortType === opt.value
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary"
                  }`}
                >
                  <span className="text-base">{opt.label}</span>
                  {sortType === opt.value && (
                    <Check className="h-5 w-5 text-primary" />
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
              {priceOptions.map((opt) => (
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
    </>
  );
}

export function SearchContent({ bannerData }: SearchContentProps) {
  return (
    <Suspense
      fallback={<p className="text-muted-foreground">読み込み中...</p>}
    >
      <SearchContentInner bannerData={bannerData} />
    </Suspense>
  );
}
