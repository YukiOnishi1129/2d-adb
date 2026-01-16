"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DbFeatureRecommendation } from "@/lib/db";

interface FeatureCarouselProps {
  features: DbFeatureRecommendation[];
  autoPlay?: boolean;
  interval?: number;
}

// カルーセルアイテムのレンダリング
function CarouselItem({ feature }: { feature: DbFeatureRecommendation }) {
  return (
    <Link href={`/feature/${feature.slug}`}>
      <Card className="overflow-hidden border border-purple-500/30 hover:border-purple-500/50 transition-all h-full">
        {/* スマホ: 画像大きめ + オーバーレイテキスト */}
        <div className="relative md:hidden">
          {feature.thumbnail_url ? (
            <div className="relative aspect-4/3 overflow-hidden">
              <img
                src={feature.thumbnail_url}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <span className="text-base font-bold text-white">{feature.name}特集</span>
                </div>
                <p className="text-sm font-bold text-white/90 line-clamp-2">
                  {feature.headline || `${feature.name}作品を厳選`}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 shrink-0">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-purple-500">{feature.name}特集</span>
              </div>
            </div>
          )}
        </div>

        {/* PC: 他のバナーと同じ高さの横並びレイアウト */}
        <div className="hidden md:flex items-center gap-4 p-4 h-full">
          {feature.thumbnail_url ? (
            <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
              <img
                src={feature.thumbnail_url}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-transparent" />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/20 shrink-0">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-bold text-purple-500">{feature.name}特集</span>
            </div>
            <p className="text-xs font-bold text-muted-foreground line-clamp-1">
              {feature.headline || `${feature.name}作品を厳選`}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-purple-500 shrink-0" />
        </div>
      </Card>
    </Link>
  );
}

// PC用: 5カラム表示で1つずつスライドするカルーセル
function GridCarouselItem({ feature }: { feature: DbFeatureRecommendation }) {
  return (
    <Link href={`/feature/${feature.slug}`}>
      <Card className="overflow-hidden border border-purple-500/30 hover:border-purple-500/50 transition-all group">
        <div className="relative aspect-4/3 overflow-hidden">
          {feature.thumbnail_url ? (
            <img
              src={feature.thumbnail_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span className="text-xs font-bold text-white truncate">{feature.name}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function FeatureGridCarousel({
  features,
  autoPlay = true,
  interval = 4000,
}: FeatureCarouselProps) {
  const visibleCount = 5; // 表示するカード数
  const cardWidthPercent = 100 / visibleCount; // 各カードの幅（%）

  // 無限ループ用に拡張した配列を作成
  // [最後の5つ] + [元の配列] + [最初の5つ]
  const extendedFeatures = features.length > visibleCount
    ? [
        ...features.slice(-visibleCount),
        ...features,
        ...features.slice(0, visibleCount),
      ]
    : features;

  // 初期位置は拡張部分をスキップした位置
  const initialIndex = features.length > visibleCount ? visibleCount : 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 次へ進む（1つずつ、左から右へスライド）
  const goToNext = useCallback(() => {
    if (isTransitioning || features.length <= visibleCount) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [isTransitioning, features.length]);

  // 前へ戻る
  const goToPrev = useCallback(() => {
    if (isTransitioning || features.length <= visibleCount) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [isTransitioning, features.length]);

  // トランジション終了時の処理（無限ループ用）
  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      setIsTransitioning(false);

      // 端に到達したら瞬時に位置をリセット
      if (currentIndex >= features.length + visibleCount) {
        // 最後を超えた → 最初へ
        setCurrentIndex(visibleCount);
      } else if (currentIndex < visibleCount) {
        // 最初を超えた → 最後へ
        setCurrentIndex(features.length + visibleCount - 1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isTransitioning, currentIndex, features.length]);

  // 自動再生
  useEffect(() => {
    if (!autoPlay || features.length <= visibleCount) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, features.length, goToNext]);

  if (features.length === 0) return null;

  const showNavigation = features.length > visibleCount;
  const translateX = currentIndex * cardWidthPercent;

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className={`flex gap-3 ${isTransitioning ? "transition-transform duration-300 ease-out" : ""}`}
          style={{
            transform: `translateX(calc(-${translateX}% - ${currentIndex * 12 / visibleCount}px))`,
          }}
        >
          {extendedFeatures.map((feature, index) => (
            <div
              key={`${feature.slug}-${index}`}
              className="shrink-0"
              style={{ width: `calc((100% - 48px) / 5)` }}
            >
              <GridCarouselItem feature={feature} />
            </div>
          ))}
        </div>
      </div>

      {/* ナビゲーション */}
      {showNavigation && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="absolute -left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            aria-label="前へ"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            aria-label="次へ"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

export function FeatureCarousel({
  features,
  autoPlay = true,
  interval = 5000,
}: FeatureCarouselProps) {
  // 無限ループ用に先頭に最後の要素、末尾に最初の要素を追加
  // [clone-last, 0, 1, 2, ..., n-1, clone-first]
  const extendedFeatures = features.length > 1
    ? [features[features.length - 1], ...features, features[0]]
    : features;

  // 実際のインデックス（拡張配列上のインデックス）
  // 初期位置は1（最初の実際の要素）
  const [slideIndex, setSlideIndex] = useState(features.length > 1 ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // 実際の表示インデックス（0〜features.length-1）
  const displayIndex = features.length > 1
    ? (slideIndex - 1 + features.length) % features.length
    : 0;

  // 次へ進む
  const goToNext = useCallback(() => {
    if (isTransitioning || features.length <= 1) return;
    setIsTransitioning(true);
    setSlideIndex((prev) => prev + 1);
  }, [isTransitioning, features.length]);

  // 前へ戻る
  const goToPrev = useCallback(() => {
    if (isTransitioning || features.length <= 1) return;
    setIsTransitioning(true);
    setSlideIndex((prev) => prev - 1);
  }, [isTransitioning, features.length]);

  // 特定のインデックスへ移動（常に右方向）
  const goToIndex = useCallback((targetDisplayIndex: number) => {
    if (isTransitioning || features.length <= 1) return;
    if (targetDisplayIndex === displayIndex) return;

    setIsTransitioning(true);
    // 現在位置から目標位置への差分を計算（常に右方向）
    const diff = targetDisplayIndex - displayIndex;
    if (diff > 0) {
      // 右に進む
      setSlideIndex((prev) => prev + diff);
    } else {
      // 左に戻る（この場合は直接左に移動）
      setSlideIndex(targetDisplayIndex + 1);
    }
  }, [isTransitioning, features.length, displayIndex]);

  // トランジション終了時の処理
  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      setIsTransitioning(false);

      // 端に到達したら瞬時に位置をリセット
      if (slideIndex >= extendedFeatures.length - 1) {
        // 最後のクローン（最初の要素）に到達 → 実際の最初の要素へ
        setSlideIndex(1);
      } else if (slideIndex <= 0) {
        // 最初のクローン（最後の要素）に到達 → 実際の最後の要素へ
        setSlideIndex(features.length);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isTransitioning, slideIndex, extendedFeatures.length, features.length]);

  // 自動再生
  useEffect(() => {
    if (!autoPlay || features.length <= 1) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, features.length, goToNext]);

  // スワイプ操作
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  if (features.length === 0) return null;

  return (
    <div className="relative h-full">
      {/* カルーセルコンテナ */}
      <div
        className="overflow-hidden h-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className={`flex ${isTransitioning ? "transition-transform duration-300 ease-out" : ""}`}
          style={{ transform: `translateX(-${slideIndex * 100}%)` }}
        >
          {extendedFeatures.map((feature, index) => (
            <div key={`${feature.slug}-${index}`} className="w-full shrink-0 h-full">
              <CarouselItem feature={feature} />
            </div>
          ))}
        </div>
      </div>

      {/* ナビゲーション（複数ある場合のみ表示） */}
      {features.length > 1 && (
        <>
          {/* 左右ボタン */}
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            aria-label="前へ"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            aria-label="次へ"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* ドットインジケーター */}
          <div className="flex justify-center gap-1.5 mt-2">
            {features.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => goToIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === displayIndex
                    ? "bg-purple-500 w-4"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-1.5"
                }`}
                aria-label={`${index + 1}番目へ`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
