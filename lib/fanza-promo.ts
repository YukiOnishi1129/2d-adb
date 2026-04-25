import type { Work } from "./types";

// FANZA同人 初回購入限定クーポン（無料会員登録のみで取得可能）
// 詳細: https://www.dmm.co.jp/dc/doujin/-/special/coupon/
const FANZA_INITIAL_COUPON_OFF = 300;
const FANZA_COUPON_LANDING_URL =
  "https://www.dmm.co.jp/dc/doujin/-/special/coupon/";
const MIN_PURCHASE_AMOUNT = 301;

const FANZA_DOUJIN_PATH_PATTERN = /\/dc\/doujin\/-\/detail\//;

const EXCLUSION_KEYWORDS = ["BL", "TL", "乙女", "ボーイズラブ"];

// 既存のFANZAアフィリURLから af_id を抽出する
// 例: https://al.fanza.co.jp/?lurl=...&af_id=monodata-990&ch=api → "monodata-990"
function extractFanzaAffiliateId(fanzaUrl: string): string | null {
  try {
    const url = new URL(fanzaUrl);
    return url.searchParams.get("af_id");
  } catch {
    return null;
  }
}

// 任意のFANZA系URLをアフィリエイトリダイレクト経由のURLに変換する
// af_id は同じ作品で使われているものを流用する（ハードコード不要）
// ch=toolbar&ch_id=text はDMMアフィリ管理画面のツールバー機能が生成する
// 正規フォーマットに合わせている
function buildFanzaAffiliateUrl(
  targetUrl: string,
  affiliateId: string,
): string {
  return `https://al.fanza.co.jp/?lurl=${encodeURIComponent(targetUrl)}&af_id=${affiliateId}&ch=toolbar&ch_id=text`;
}

export interface FanzaInitialDiscount {
  couponOff: number;
  effectivePrice: number;
  couponLandingUrl: string;
}

export function getFanzaInitialDiscount(
  work: Work,
): FanzaInitialDiscount | null {
  if (!work.fanzaUrl || !work.priceFanza) return null;

  const affiliateId = extractFanzaAffiliateId(work.fanzaUrl);
  if (!affiliateId) return null;

  const fanzaPriceWithSale = work.discountRateFanza
    ? Math.floor(work.priceFanza * (1 - work.discountRateFanza / 100))
    : work.priceFanza;

  if (fanzaPriceWithSale < MIN_PURCHASE_AMOUNT) return null;

  const decodedUrl = decodeURIComponent(work.fanzaUrl);
  if (!FANZA_DOUJIN_PATH_PATTERN.test(decodedUrl)) return null;

  const tagsToCheck = [...(work.aiTags ?? []), work.genre ?? ""].filter(Boolean);
  if (
    tagsToCheck.some((tag) =>
      EXCLUSION_KEYWORDS.some((keyword) => tag.includes(keyword)),
    )
  ) {
    return null;
  }

  return {
    couponOff: FANZA_INITIAL_COUPON_OFF,
    effectivePrice: fanzaPriceWithSale - FANZA_INITIAL_COUPON_OFF,
    couponLandingUrl: buildFanzaAffiliateUrl(
      FANZA_COUPON_LANDING_URL,
      affiliateId,
    ),
  };
}
