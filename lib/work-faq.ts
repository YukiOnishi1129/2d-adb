import type { Work } from "./types";

export interface FaqItem {
  question: string;
  answer: string;
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

// 作品詳細ページに表示するFAQ（FAQ Schema にも使う）
// 作品データから動的に質問と回答を組み立てる
export function buildWorkFaq(work: Work): FaqItem[] {
  const faq: FaqItem[] = [];

  // 1. 価格・どこで買うのが安いか
  const dlPrice = work.priceDlsite && work.discountRateDlsite
    ? Math.round(work.priceDlsite * (1 - work.discountRateDlsite / 100))
    : work.priceDlsite;
  const fzPrice = work.priceFanza && work.discountRateFanza
    ? Math.round(work.priceFanza * (1 - work.discountRateFanza / 100))
    : work.priceFanza;

  if (dlPrice && fzPrice) {
    const cheaperPlatform = fzPrice <= dlPrice ? "FANZA" : "DLsite";
    const cheaperPrice = fzPrice <= dlPrice ? fzPrice : dlPrice;
    const otherPrice = fzPrice <= dlPrice ? dlPrice : fzPrice;
    const diff = otherPrice - cheaperPrice;
    if (diff > 0) {
      faq.push({
        question: `「${work.title}」はDLsiteとFANZAどちらが安いですか？`,
        answer: `現在、${cheaperPlatform}の方が${formatPrice(diff)}安く、${formatPrice(cheaperPrice)}で購入できます。価格は変動するため、購入時に最新の価格をご確認ください。`,
      });
    } else {
      faq.push({
        question: `「${work.title}」はDLsiteとFANZAどちらが安いですか？`,
        answer: `現在、DLsiteとFANZAの価格はどちらも${formatPrice(cheaperPrice)}で同額です。お好きなプラットフォームで購入できます。`,
      });
    }
  } else if (dlPrice && !fzPrice) {
    faq.push({
      question: `「${work.title}」はどこで購入できますか？`,
      answer: `本作品はDLsiteで${formatPrice(dlPrice)}で購入できます。`,
    });
  } else if (fzPrice && !dlPrice) {
    faq.push({
      question: `「${work.title}」はどこで購入できますか？`,
      answer: `本作品はFANZAで${formatPrice(fzPrice)}で購入できます。`,
    });
  }

  // 2. セール情報
  const discountRate = work.maxDiscountRate;
  const saleEnd = work.saleEndDateDlsite || work.saleEndDateFanza;
  if (work.isOnSale && discountRate && discountRate > 0) {
    const saleEndText = saleEnd
      ? `${saleEnd.split("T")[0]?.replace(/-/g, "/") || saleEnd}まで`
      : "期間限定で";
    faq.push({
      question: `「${work.title}」はセール中ですか？`,
      answer: `はい、現在最大${discountRate}%OFFのセール中です。${saleEndText}の特別価格となっています。`,
    });
  }

  // 3. 評価
  const rating = work.ratingDlsite || work.ratingFanza;
  const reviewCount =
    (work.reviewCountDlsite || 0) + (work.reviewCountFanza || 0);
  if (rating && reviewCount > 0) {
    faq.push({
      question: `「${work.title}」の評価はどうですか？`,
      answer: `本作品の評価は★${rating.toFixed(1)}（${reviewCount.toLocaleString()}件のレビュー）です。${
        rating >= 4.5
          ? "ユーザーから非常に高い評価を得ている人気作品です。"
          : rating >= 4.0
            ? "ユーザーから高評価を得ています。"
            : "詳細はサンプルや体験版でご確認ください。"
      }`,
    });
  }

  // 4. 体験版・サンプル
  if (work.sampleImages && work.sampleImages.length > 0) {
    faq.push({
      question: `「${work.title}」の体験版・サンプルはありますか？`,
      answer: `はい、サンプル画像${work.sampleImages.length}枚が公開されています。DLsiteまたはFANZAの作品ページで体験版・サンプルを確認できます。`,
    });
  }

  // 5. CV / 声優
  if (work.actors && work.actors.length > 0) {
    faq.push({
      question: `「${work.title}」の出演声優は誰ですか？`,
      answer: `本作品には${work.actors.join("、")}さんが出演しています。`,
    });
  }

  // 6. ジャンル / カテゴリ
  if (work.category) {
    const categoryDescription =
      work.category === "ASMR" || work.genre?.includes("音声")
        ? `本作品は同人ASMR・音声作品です。`
        : work.genre?.includes("ゲーム")
          ? `本作品は同人ゲーム作品です。`
          : work.category === "CG集"
            ? `本作品は同人CG集です。`
            : `本作品は${work.category}カテゴリの同人作品です。`;
    const tags = work.aiTags?.slice(0, 3).join("、");
    faq.push({
      question: `「${work.title}」はどんなジャンルの作品ですか？`,
      answer: tags
        ? `${categoryDescription}主なタグは「${tags}」などです。`
        : categoryDescription,
    });
  }

  return faq;
}
