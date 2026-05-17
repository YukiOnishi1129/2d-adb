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

// =============================================================================
// Organization JSON-LD（サイト全体の運営主体を Google / AI に伝える）
// =============================================================================
// SEO目的:
// - E-E-A-T の「権威性・信頼性」を構造化データとして提示
// - AI（AIによる概要 / AIモード）への引用時の責任主体識別
// - 匿名アフィリエイトサイトとの差別化
//
// root layout で1度だけ出力すれば全ページに反映される
export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "2D-ADB",
    alternateName: "2D-ADB編集部",
    url: "https://2d-adb.com",
    logo: "https://2d-adb.com/ogp/recommendation_ogp.png",
    description:
      "ASMR・同人音声・同人ゲームの厳選作品レビューサイト。評価・ランキング・セール情報をAIによる分析と人手の編集で整理してお届けします。",
    sameAs: [
      "https://x.com/2d_adb",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// =============================================================================
// WebSite JSON-LD（サイト内検索のサジェスト + サイト名統一）
// =============================================================================
export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "2D-ADB",
    alternateName: "2D-ADB | ASMR・同人音声の厳選おすすめ作品",
    url: "https://2d-adb.com",
    inLanguage: "ja",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://2d-adb.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// =============================================================================
// Person JSON-LD（声優ページ用）
// =============================================================================
// SEO目的:
// - 声優を「人物エンティティ」として Google / AI に明示
// - 声優名でのナレッジパネル候補化、AIモード引用時の精度向上
// - E-E-A-T の「専門性」を声優単位で表現
interface PersonJsonLdProps {
  name: string;
  /** 出演作品数 */
  workCount: number;
  /** 平均評価（1-5） */
  avgRating?: number | null;
  /** 代表作のサムネURL（OG画像兼）。null可 */
  thumbnailUrl?: string | null;
  /** 声優プロフィールページURL（絶対URL推奨） */
  pageUrl: string;
}

export function PersonJsonLd({
  name,
  workCount,
  avgRating,
  thumbnailUrl,
  pageUrl,
}: PersonJsonLdProps) {
  const description = `同人ASMR・同人音声・同人ゲーム作品に出演する声優「${name}」の出演作品${workCount}件をまとめたページ。レビュー・評価・人気作・セール情報を2D-ADB編集部が整理しています。`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: pageUrl,
    description,
    jobTitle: "声優",
    knowsAbout: ["ASMR", "同人音声", "ボイス作品"],
  };

  if (thumbnailUrl) {
    jsonLd.image = thumbnailUrl;
  }

  // 出演実績を Person.performerIn ではなく aggregateRating として
  // 「この人物の出演作品の平均評価」を一段足す形で表現
  if (avgRating && avgRating > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(2),
      reviewCount: workCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// =============================================================================
// Circle (Organization) JSON-LD（サークルページ用）
// =============================================================================
// SEO目的:
// - サークルを「組織エンティティ」として明示
// - サークル名で検索した際の Knowledge 候補化
interface CircleOrganizationJsonLdProps {
  name: string;
  /** 作品数 */
  workCount: number;
  /** メインジャンル（ASMR / ゲーム など） */
  mainGenre?: string | null;
  pageUrl: string;
}

export function CircleOrganizationJsonLd({
  name,
  workCount,
  mainGenre,
  pageUrl,
}: CircleOrganizationJsonLdProps) {
  const genreText = mainGenre ? `（${mainGenre}）` : "";
  const description = `同人サークル「${name}」${genreText}の作品${workCount}件をまとめたページ。サークルの代表作・人気作・セール情報を2D-ADB編集部が整理しています。`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: pageUrl,
    description,
    // 同人サークルなので、より具体的な type を additionalType で示す
    additionalType: "https://schema.org/CreativeWork",
  };

  if (mainGenre) {
    jsonLd.knowsAbout = [mainGenre, "同人作品"];
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// =============================================================================
// Article JSON-LD（特集ページ用 / 編集部記事として明示）
// =============================================================================
// SEO目的:
// - 特集ページを「編集記事」として Google / AI に伝える
// - E-E-A-T の「経験・専門性」を author 経由で表現
// - AIモードで「○○の特集記事を探して」のような検索に引っかかりやすくする
interface ArticleJsonLdProps {
  /** 記事タイトル（headline）。SEOガイドの推奨は110文字以内 */
  headline: string;
  /** 記事の要約 */
  description: string;
  /** 記事のURL（絶対URL推奨） */
  url: string;
  /** OG画像（記事のサムネ） */
  imageUrl?: string | null;
  /** 記事の発行日（ISO 8601）。未指定ならビルド時刻 */
  datePublished?: string;
}

export function ArticleJsonLd({
  headline,
  description,
  url,
  imageUrl,
  datePublished,
}: ArticleJsonLdProps) {
  const buildDate = getBuildDateIso();
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: headline.slice(0, 110),
    description,
    url,
    inLanguage: "ja",
    datePublished: datePublished ?? buildDate,
    dateModified: buildDate,
    author: {
      "@type": "Organization",
      name: "2D-ADB編集部",
      url: "https://2d-adb.com/editorial/",
    },
    publisher: {
      "@type": "Organization",
      name: "2D-ADB",
      url: "https://2d-adb.com",
      logo: {
        "@type": "ImageObject",
        url: "https://2d-adb.com/ogp/recommendation_ogp.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  if (imageUrl) {
    jsonLd.image = imageUrl;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
