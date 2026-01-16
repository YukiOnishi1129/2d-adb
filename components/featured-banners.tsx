import Link from "next/link";
import { Sparkles, Trophy, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FeatureCarousel, FeatureGridCarousel } from "@/components/feature-carousel";
import type { DbFeatureRecommendation } from "@/lib/db";

interface FeaturedBannersProps {
  saleThumbnail?: string | null;
  saleMaxDiscountRate?: number | null;
  saleTargetDate?: string | null;
  mainWorkSaleEndDate?: string | null;
  recommendationThumbnail?: string | null;
  recommendationDate?: string | null;
  features?: DbFeatureRecommendation[];
}

// 日付を「1/15」形式にフォーマット
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function FeaturedBanners({
  saleThumbnail,
  saleMaxDiscountRate,
  saleTargetDate,
  mainWorkSaleEndDate,
  recommendationThumbnail,
  recommendationDate,
  features = [],
}: FeaturedBannersProps) {
  // メインタイトル: 「1/14のセール特集」のような形式
  const saleTitle = saleTargetDate
    ? `${formatShortDate(saleTargetDate)}のセール特集`
    : "セール特集";

  // サブテキスト: 「1/20まで最大99%OFF！」のような形式
  let saleSubtext = "厳選おすすめ作品";
  if (saleMaxDiscountRate && mainWorkSaleEndDate) {
    saleSubtext = `${formatShortDate(mainWorkSaleEndDate)}まで最大${saleMaxDiscountRate}%OFF！`;
  } else if (saleMaxDiscountRate) {
    saleSubtext = `最大${saleMaxDiscountRate}%OFF！`;
  }

  // 「1/12の厳選5作品！」のような形式
  const recommendationSubtext = recommendationDate
    ? `${formatShortDate(recommendationDate)}の厳選5作品！`
    : "迷ったらコレ！TOP5";

  const hasFeatures = features.length > 0;

  return (
    <div className="mb-6 space-y-3 md:space-y-4">
      {/* 上段: 編集部おすすめとセール特集（2カラム） */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
      {/* 編集部おすすめ（左） */}
      <Link href="/recommendations">
        <Card className="overflow-hidden border border-amber-500/30 hover:border-amber-500/50 transition-all h-full">
          {/* スマホ: 画像大きめ + オーバーレイテキスト */}
          <div className="relative md:hidden">
            {recommendationThumbnail ? (
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={recommendationThumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-white">編集部おすすめ</span>
                  </div>
                  <p className="text-[10px] font-bold text-white/80">
                    {recommendationSubtext}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 shrink-0">
                  <Trophy className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-amber-500">編集部おすすめ</span>
                </div>
              </div>
            )}
          </div>

          {/* PC: 横並びレイアウト */}
          <div className="hidden md:flex items-center gap-4 p-4">
            {recommendationThumbnail ? (
              <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                <img
                  src={recommendationThumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-amber-500/20 to-transparent" />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 shrink-0">
                <Trophy className="h-6 w-6 text-amber-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="text-base font-bold text-amber-500">編集部おすすめ</span>
              </div>
              <p className="text-sm font-bold text-muted-foreground">
                {recommendationSubtext}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-500 shrink-0" />
          </div>
        </Card>
      </Link>

      {/* セール特集（右） */}
      <Link href="/sale/tokushu">
        <Card className="overflow-hidden border border-sale/30 hover:border-sale/50 transition-all h-full">
          {/* スマホ: 画像大きめ + オーバーレイテキスト */}
          <div className="relative md:hidden">
            {saleThumbnail ? (
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={saleThumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-sale" />
                    <span className="text-xs font-bold text-white">{saleTitle}</span>
                  </div>
                  <p className="text-[10px] font-bold text-white/80">
                    {saleSubtext}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sale/20 shrink-0">
                  <Sparkles className="h-5 w-5 text-sale" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-sale">{saleTitle}</span>
                </div>
              </div>
            )}
          </div>

          {/* PC: 横並びレイアウト */}
          <div className="hidden md:flex items-center gap-4 p-4">
            {saleThumbnail ? (
              <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                <img
                  src={saleThumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-sale/20 to-transparent" />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sale/20 shrink-0">
                <Sparkles className="h-6 w-6 text-sale" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-sale" />
                <span className="text-base font-bold text-sale">{saleTitle}</span>
              </div>
              <p className="text-sm font-bold text-muted-foreground">
                {saleSubtext}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-sale shrink-0" />
          </div>
        </Card>
      </Link>

      </div>

      {/* 下段: キーワード特集 */}
      {hasFeatures && (
        <>
          {/* スマホ: カルーセル */}
          <div className="md:hidden">
            <FeatureCarousel features={features} />
          </div>
          {/* PC: 横スライドカルーセル（5カラム表示） */}
          <div className="hidden md:block">
            <FeatureGridCarousel features={features} />
          </div>
        </>
      )}
    </div>
  );
}
