import type { Work } from "@/lib/types";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProductJsonLdProps {
  work: Work;
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
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "JPY",
      lowPrice: lowestPrice || 0,
      highPrice: Math.max(work.priceDlsite || 0, work.priceFanza || 0),
      offerCount: [work.priceDlsite, work.priceFanza].filter(Boolean).length,
      availability: "https://schema.org/InStock",
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
