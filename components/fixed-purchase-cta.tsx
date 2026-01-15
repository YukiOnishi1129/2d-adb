"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FixedPurchaseCtaProps {
  priceDlsite: number | null | undefined; // セール価格適用済み
  priceFanza: number | null | undefined; // セール価格適用済み
  originalPriceDlsite: number | null | undefined; // 定価
  originalPriceFanza: number | null | undefined; // 定価
  dlsiteUrl: string | null;
  fanzaUrl: string | null;
  discountRateDlsite: number | null;
  discountRateFanza: number | null;
  saleEndDateDlsite: string | null;
  saleEndDateFanza: string | null;
  category: string | null | undefined;
}

function getCtaLabel(category: string | null | undefined): string {
  if (!category) return "購入する";
  const cat = category.toLowerCase();
  if (cat === "asmr" || cat === "音声作品") {
    return "🎧 無料で試聴";
  }
  if (cat === "game" || cat === "ゲーム") {
    return "🎮 体験版あり";
  }
  if (cat === "動画" || cat === "video") {
    return "🎬 無料で視聴";
  }
  return "購入する";
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

function formatSaleEndDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  return `${month}/${day} ${hours}時まで`;
}

export function FixedPurchaseCta({
  priceDlsite,
  priceFanza,
  originalPriceDlsite,
  originalPriceFanza,
  dlsiteUrl,
  fanzaUrl,
  discountRateDlsite,
  discountRateFanza,
  saleEndDateDlsite,
  saleEndDateFanza,
  category,
}: FixedPurchaseCtaProps) {
  // 最安値のプラットフォームを判定（セール価格適用済みの値で比較）
  const getCheaperOption = () => {
    if (priceDlsite && priceFanza) {
      if (priceDlsite <= priceFanza) {
        return {
          platform: "DLsite",
          price: priceDlsite,
          originalPrice: originalPriceDlsite,
          url: dlsiteUrl,
          discountRate: discountRateDlsite,
          saleEndDate: saleEndDateDlsite,
        };
      }
      return {
        platform: "FANZA",
        price: priceFanza,
        originalPrice: originalPriceFanza,
        url: fanzaUrl,
        discountRate: discountRateFanza,
        saleEndDate: saleEndDateFanza,
      };
    }
    if (priceDlsite)
      return {
        platform: "DLsite",
        price: priceDlsite,
        originalPrice: originalPriceDlsite,
        url: dlsiteUrl,
        discountRate: discountRateDlsite,
        saleEndDate: saleEndDateDlsite,
      };
    if (priceFanza)
      return {
        platform: "FANZA",
        price: priceFanza,
        originalPrice: originalPriceFanza,
        url: fanzaUrl,
        discountRate: discountRateFanza,
        saleEndDate: saleEndDateFanza,
      };
    return null;
  };

  const cheaper = getCheaperOption();
  const discountRate = cheaper?.discountRate;
  const isOnSale =
    discountRate !== null && discountRate !== undefined && discountRate > 0;

  if (!cheaper || !cheaper.url) return null;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 border-t border-border bg-background p-3 shadow-lg md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        {/* 価格情報 */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            {/* 定価を打ち消し線で表示 */}
            {isOnSale && cheaper.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(cheaper.originalPrice)}
              </span>
            )}
            <span
              className={`text-xl font-bold ${isOnSale ? "text-red-500" : "text-foreground"}`}
            >
              {formatPrice(cheaper.price)}
            </span>
            {isOnSale && discountRate && (
              <Badge variant="sale" className="text-[10px] px-1.5 py-0">
                {discountRate}%OFF
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {cheaper.platform}で購入
            </span>
            {/* セール終了日時 */}
            {isOnSale && cheaper.saleEndDate && (
              <span className="text-xs text-red-500 font-medium">
                {formatSaleEndDate(cheaper.saleEndDate)}
              </span>
            )}
          </div>
        </div>

        {/* 購入ボタン - 緑系でCVR向上 */}
        <Button
          asChild
          className="flex-shrink-0 gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold"
        >
          <a href={cheaper.url} target="_blank" rel="noopener noreferrer">
            {getCtaLabel(category)}
          </a>
        </Button>
      </div>
    </div>
  );
}
