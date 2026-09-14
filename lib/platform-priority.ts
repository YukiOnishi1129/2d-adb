import type { Work } from "./types";

/**
 * 作品ページで「主役」として出すプラットフォームの判定。
 *
 * 元は同じ判定が4箇所（作品詳細の上下CTA・一覧カード・FAQ）にコピーされていたため、
 * ここに集約した。挙動は従来どおり「安い方。同額ならFANZA」。
 *
 * 補足（2026-09-13 GA4実測）:
 * - ユーザーは主役として表示されたリンクしか押さない
 *   （DLsite主役ページの fanza_click は実測0件）。
 * - 1クリックあたりの報酬は FANZA 53.7円 / DLsite 5.2円（2026年8月）と約10倍の差がある。
 * そのため一時は「FANZAが多少高くても主役にする」案を検討したが、
 * DLsite・FANZAの両方で販売されている作品は全体の6%しかなく、
 * 閾値を変えてもほぼ影響が出ないため見送った。
 */

/**
 * FANZAを主役にする価格の許容倍率。
 *
 * FANZAがDLsiteのこの倍率以内の価格であればFANZAを主役として表示する。
 * 1.0 は「安い方。同額ならFANZA」で、従来からの挙動。
 *
 * 1.0 より大きくすると「FANZAが多少高くても主役にする」挙動になるが、
 * 両方で販売されている作品が6%しかないため効果は限定的で、
 * 「高い方を勧める」ことになるためユーザー体験とのトレードオフがある。
 */
export const FANZA_PRICE_TOLERANCE = 1.0;

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
