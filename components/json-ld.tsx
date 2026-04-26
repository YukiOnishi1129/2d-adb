import type { Work } from "@/lib/types";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProductJsonLdProps {
  work: Work;
}

// ビルド時の日時を ISO 8601 形式で取得（schema.org の dateModified に使用）
// 価格・セール情報を毎日更新しているサイトであることを Google に伝える
function getBuildDateIso(): string {
  return new Date().toISOString();
}

export function ProductJsonLd({ work }: ProductJsonLdProps) {
  // 最安価格を計算
  const dlsiteFinalPrice =
    work.priceDlsite && work.discountRateDlsite
      ? Math.round(work.priceDlsite * (1 - work.discountRateDlsite / 100))
      : work.priceDlsite;
  const fanzaFinalPrice =
    work.priceFanza && work.discountRateFanza
      ? Math.round(work.priceFanza * (1 - work.discountRateFanza / 100))
      : work.priceFanza;

  const lowestPrice = Math.min(
    ...[dlsiteFinalPrice, fanzaFinalPrice].filter((p): p is number => p !== null)
  );

  // 評価情報
  const rating = work.ratingDlsite || work.ratingFanza;
  const reviewCount = work.reviewCountDlsite || work.reviewCountFanza;

  // セール終了日（DLsite優先、なければFANZA）
  const saleEndDate = work.saleEndDateDlsite || work.saleEndDateFanza;
  const buildDate = getBuildDateIso();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: work.title,
    description: work.aiSummary || work.aiRecommendReason || `${work.title}の詳細ページ`,
    image: work.thumbnailUrl || work.sampleImages[0],
    brand: work.circleName
      ? {
          "@type": "Brand",
          name: work.circleName,
        }
      : undefined,
    category: work.category || "デジタルコンテンツ",
    // 最終更新日（ビルド毎に自動更新、Google に「アクティブに更新中のサイト」と伝える）
    dateModified: buildDate,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "JPY",
      lowPrice: lowestPrice || 0,
      highPrice: Math.max(work.priceDlsite || 0, work.priceFanza || 0),
      offerCount: [work.priceDlsite, work.priceFanza].filter(Boolean).length || 1,
      availability: "https://schema.org/InStock",
      // セール終了日が設定されていれば priceValidUntil として伝える
      ...(saleEndDate && { priceValidUntil: saleEndDate }),
    },
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating.toFixed(1),
          bestRating: "5",
          worstRating: "1",
          reviewCount: reviewCount,
        },
      }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ReviewJsonLd({ work }: ProductJsonLdProps) {
  const reviewBody = work.aiReview || work.aiAppealPoints || work.aiSummary;

  if (!reviewBody) return null;

  const buildDate = getBuildDateIso();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: work.title,
      ...(work.thumbnailUrl && { image: work.thumbnailUrl }),
    },
    author: {
      "@type": "Organization",
      name: "2D-ADB",
    },
    reviewBody: reviewBody,
    // レビューの公開日 / 最終更新日（毎日のビルドで更新される）
    datePublished: buildDate,
    dateModified: buildDate,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

export function BreadcrumbJsonLd({
  items,
  baseUrl = "https://2d-adb.com",
}: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${baseUrl}${item.href}` : undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqJsonLdProps {
  items: FaqItem[];
}

export function FaqJsonLd({ items }: FaqJsonLdProps) {
  if (items.length === 0) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
