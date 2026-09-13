import type { Work } from "./types";

/**
 * 作品ページで「主役」として出すプラットフォームの判定。
 *
 * 背景（2026-09-13 GA4実測）:
 * - ユーザーは主役として表示されたリンクしか押さない。
 *   DLsite主役ページの fanza_click は実測0件で、ページ下部の価格比較表にある
 *   もう一方のリンクは事実上機能していない。
 * - 1クリックあたりの報酬は FANZA 53.7円 / DLsite 5.2円（2026年8月）と約10倍の差がある。
 *
 * したがって、わずかに高い程度であればFANZAを主役にした方が期待収益は高い。
 * ただし「高い方を勧める」ことになるため、閾値は控えめに設定する。
 */

/**
 * FANZAを主役にする価格の許容倍率。
 *
 * FANZAがDLsiteのこの倍率以内の価格であれば、FANZAを主役として表示する。
 * 1.0 にすると従来どおり「安い方（同額ならFANZA）」になる。
 *
 * 1.15 は、1,000円の作品で150円差までを許容する水準。
 * 単価差が10倍あるため期待値上は十分見合うが、
 * ユーザーが「明らかに高い方を勧められた」と感じない範囲に留めている。
 */
export const FANZA_PRICE_TOLERANCE = 1.15;

export interface PlatformChoice {
  platform: "dlsite" | "fanza";
  url: string | null;
  price: number | null;
  originalPrice: number | null;
  discountRate: number | null;
}

/** セール後の実売価格を求める */
export function getFinalPrice(
  price: number | null,
  discountRate: number | null,
): number | null {
  if (!price) return null;
  if (!discountRate) return price;
  return Math.round(price * (1 - discountRate / 100));
}

function dlsiteChoice(work: Work, price: number | null): PlatformChoice {
  return {
    platform: "dlsite",
    url: work.dlsiteUrl,
    price,
    originalPrice: work.priceDlsite,
    discountRate: work.discountRateDlsite,
  };
}

function fanzaChoice(work: Work, price: number | null): PlatformChoice {
  return {
    platform: "fanza",
    url: work.fanzaUrl,
    price,
    originalPrice: work.priceFanza,
    discountRate: work.discountRateFanza,
  };
}

/**
 * 購入CTAで主役にするプラットフォームを返す。
 *
 * 片方でしか扱いがなければそちらを返す。
 * 両方にある場合は、FANZAが `FANZA_PRICE_TOLERANCE` 倍以内の価格ならFANZAを選ぶ。
 */
export function getPrimaryPlatform(work: Work): PlatformChoice | null {
  const dlPrice = getFinalPrice(work.priceDlsite, work.discountRateDlsite);
  const fzPrice = getFinalPrice(work.priceFanza, work.discountRateFanza);

  if (dlPrice && fzPrice) {
    // FANZAが許容範囲内の価格ならFANZAを主役にする
    return fzPrice <= dlPrice * FANZA_PRICE_TOLERANCE
      ? fanzaChoice(work, fzPrice)
      : dlsiteChoice(work, dlPrice);
  }
  if (fzPrice) return fanzaChoice(work, fzPrice);
  if (dlPrice) return dlsiteChoice(work, dlPrice);
  return null;
}

/**
 * 実際に安い方のプラットフォームを返す（価格比較の表示用）。
 *
 * FAQや価格比較表など「どちらが安いか」を事実として伝える箇所では、
 * 主役判定ではなくこちらを使う。
 */
export function getCheapestPlatform(work: Work): PlatformChoice | null {
  const dlPrice = getFinalPrice(work.priceDlsite, work.discountRateDlsite);
  const fzPrice = getFinalPrice(work.priceFanza, work.discountRateFanza);

  if (dlPrice && fzPrice) {
    return fzPrice <= dlPrice
      ? fanzaChoice(work, fzPrice)
      : dlsiteChoice(work, dlPrice);
  }
  if (fzPrice) return fanzaChoice(work, fzPrice);
  if (dlPrice) return dlsiteChoice(work, dlPrice);
  return null;
}
