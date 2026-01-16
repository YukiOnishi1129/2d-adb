import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";
import { SaleTimer } from "@/components/sale-timer";
import { SaleBannerCountdown } from "@/components/sale-banner-countdown";
import { SpecTable } from "@/components/spec-table";
import { FixedPurchaseCta } from "@/components/fixed-purchase-cta";
import { FeaturedBanners } from "@/components/featured-banners";
import { ThemeQueryProvider } from "@/components/theme-query-provider";
import { SampleImageGallery } from "@/components/sample-image-gallery";
import { WorkCard } from "@/components/work-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getWorkById,
  getWorkByRjCode,
  getAllWorkIds,
  getLatestSaleFeature,
  getLatestDailyRecommendation,
  getWorksByIds,
  getVoiceRankingWorks,
  getSaleWorks,
  getRelatedWorks,
  getAllFeatures,
} from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

function getCtaLabel(category: string | null | undefined): string {
  if (!category) return "詳細を見る";
  const cat = category.toLowerCase();
  if (cat === "asmr" || cat === "音声作品") {
    return "🎧 試聴してみる";
  }
  if (cat === "game" || cat === "ゲーム") {
    return "🎮 体験版で遊ぶ";
  }
  if (cat === "動画" || cat === "video") {
    return "🎬 サンプルを見る";
  }
  return "詳細を見る";
}

// IDまたはRJコードで作品を取得
async function getWork(idOrRjCode: string) {
  // RJコード形式かチェック (RJ + 数字)
  if (/^RJ\d+$/i.test(idOrRjCode)) {
    return await getWorkByRjCode(idOrRjCode.toUpperCase());
  }
  // 数値IDの場合
  const numericId = parseInt(idOrRjCode, 10);
  if (!Number.isNaN(numericId)) {
    return await getWorkById(numericId);
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const dbWork = await getWork(id);

  if (!dbWork) {
    return {
      title: "作品が見つかりません | 2D-ADB",
    };
  }

  const work = dbWorkToWork(dbWork);

  // タイトル: セール中なら割引率を含める
  const salePrefix =
    work.isOnSale && work.maxDiscountRate
      ? `【${work.maxDiscountRate}%OFF】`
      : "";
  const title = `${salePrefix}${work.title} | 2D-ADB`;

  // description: 評価情報 + 刺さりポイント優先、なければおすすめ理由や要約
  const ratingText = work.ratingDlsite ? `評価${work.ratingDlsite.toFixed(1)}` : "";
  const baseDescription =
    work.aiAppealPoints ||
    work.aiRecommendReason ||
    work.aiSummary ||
    "";
  const description = baseDescription
    ? `${ratingText ? `${ratingText}の` : ""}${baseDescription}`
    : `${work.title}の価格比較・セール情報・レビューをチェック`;

  // OG画像: サムネイル優先
  const ogImage = work.thumbnailUrl || work.sampleImages[0] || null;

  // キーワード: タグ + CV名 + サークル名 + カテゴリ
  const keywords = [
    ...(work.aiTags || []),
    ...(work.actors || []),
    work.circleName,
    work.category,
    "ASMR",
    "同人音声",
    "DLsite",
    "FANZA",
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 800,
            height: 450,
            alt: work.title,
          },
        ],
      }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export async function generateStaticParams() {
  const ids = await getAllWorkIds();
  return ids.map((id) => ({
    id: id.toString(),
  }));
}

export const dynamic = "force-static";

export default async function WorkDetailPage({ params }: Props) {
  const { id } = await params;
  const dbWork = await getWork(id);

  if (!dbWork) {
    notFound();
  }

  const work = dbWorkToWork(dbWork);

  // バナー用データ取得 + 関連作品 + 特集データ
  const [saleFeature, dailyRecommendation, dbVoiceRanking, dbSaleWorks, dbRelatedWorks, allFeatures] = await Promise.all([
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
    getVoiceRankingWorks(1),
    getSaleWorks(1),
    getRelatedWorks(work.id, 4),
    getAllFeatures(),
  ]);
  const relatedWorks = dbRelatedWorks.map(dbWorkToWork);

  // 作品がマッチする特集を検索（タグ・タイトルで判定）
  const FEATURE_TAG_MAP: Record<string, string[]> = {
    "nipple": ["乳首責め", "乳首", "乳首いじり"],
    "onasapo": ["オナサポ", "オナニーサポート"],
    "edging": ["射精管理", "寸止め", "焦らし"],
  };

  const matchedFeatures = allFeatures.filter((feature) => {
    const tags = FEATURE_TAG_MAP[feature.slug] || [];
    // ai_tagsでマッチ
    if (work.aiTags?.some(tag => tags.some(ft => tag.includes(ft)))) {
      return true;
    }
    // タイトルでマッチ
    if (work.title && tags.some(ft => work.title.includes(ft))) {
      return true;
    }
    return false;
  });

  // セール特集のメイン作品のサムネイルを取得
  const saleFeatureMainWork = saleFeature?.main_work_id
    ? await getWorkById(saleFeature.main_work_id)
    : null;

  // おすすめのASMR1位作品のサムネイルを取得
  const recommendationWorkIds = dailyRecommendation?.asmr_works?.[0]?.work_id
    ? [dailyRecommendation.asmr_works[0].work_id]
    : [];
  const recommendationWorks = recommendationWorkIds.length > 0
    ? await getWorksByIds(recommendationWorkIds)
    : [];

  // バナー用サムネイル・セール特集日
  const saleThumbnail = saleFeatureMainWork?.thumbnail_url || dbSaleWorks[0]?.thumbnail_url;
  const saleTargetDate = saleFeature?.target_date;
  const mainWorkSaleEndDate = saleFeatureMainWork?.sale_end_date_dlsite || saleFeatureMainWork?.sale_end_date_fanza;
  const recommendationThumbnail = recommendationWorks[0]?.thumbnail_url || dbVoiceRanking[0]?.thumbnail_url;
  const isOnSale = work.isOnSale;
  const hasBothPrices = work.priceDlsite && work.priceFanza;

  // 最安プラットフォーム判定（セール価格考慮）
  const dlsiteFinalPrice =
    work.priceDlsite && work.discountRateDlsite
      ? Math.round(work.priceDlsite * (1 - work.discountRateDlsite / 100))
      : work.priceDlsite;
  const fanzaFinalPrice =
    work.priceFanza && work.discountRateFanza
      ? Math.round(work.priceFanza * (1 - work.discountRateFanza / 100))
      : work.priceFanza;
  const cheaperPlatform =
    hasBothPrices && dlsiteFinalPrice! <= fanzaFinalPrice! ? "DLsite" : "FANZA";

  // セール終了日時（DLsite優先）
  const saleEndDate = work.saleEndDateDlsite || work.saleEndDateFanza;

  const breadcrumbItems = [
    { label: "トップ", href: "/" },
    { label: "作品一覧", href: "/search" },
    { label: work.title },
  ];

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-0">
      {/* 構造化データ */}
      <ProductJsonLd work={work} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* ?theme=dark クエリパラメータでダークモード対応 */}
      <Suspense fallback={null}>
        <ThemeQueryProvider />
      </Suspense>
      <Header />

      {/* セール中固定バナー（スマホのみ） */}
      {isOnSale && saleEndDate && (
        <div className="sticky top-16 z-40 bg-linear-to-r from-red-500 to-orange-500 text-white py-1.5 px-4 shadow-md md:hidden">
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="font-bold">{work.maxDiscountRate}%OFF</span>
            <span>終了まで</span>
            <SaleBannerCountdown endDate={saleEndDate} />
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* 今日のセール特集 & 今日のおすすめバナー */}
        <FeaturedBanners
          saleThumbnail={saleThumbnail}
          saleMaxDiscountRate={saleFeature?.max_discount_rate}
          saleTargetDate={saleTargetDate}
          mainWorkSaleEndDate={mainWorkSaleEndDate}
          recommendationThumbnail={recommendationThumbnail}
          recommendationDate={dailyRecommendation?.target_date}
        />

        <Breadcrumb items={breadcrumbItems} />

        {/* ヒーローセクション: メイン画像（sample_images[0]を優先、なければthumbnail） */}
        <div className="relative mb-6 overflow-hidden rounded-lg">
          <img
            src={
              work.thumbnailUrl ||
              "https://placehold.co/800x450/f4f4f5/71717a?text=No+Image"
            }
            alt={work.title}
            className="w-full max-h-[500px] object-contain bg-black/5"
          />
          {isOnSale && work.maxDiscountRate && (
            <Badge
              variant="sale"
              className="absolute top-4 left-4 text-lg px-3 py-1"
            >
              {work.maxDiscountRate}%OFF
            </Badge>
          )}
          {work.category && (
            <Badge
              variant="secondary"
              className="absolute top-4 right-4 text-sm"
            >
              {work.category}
            </Badge>
          )}
        </div>

        {/* 作品情報セクション */}
        <div className="space-y-6">
          {/* タイトル・基本情報 */}
          <div className="space-y-4">
            {/* カテゴリ + 評価 */}
            <div className="flex items-center gap-3 flex-wrap">
              {work.category && (
                <Badge variant="outline">{work.category}</Badge>
              )}
              {(work.ratingDlsite || work.ratingFanza) &&
                (() => {
                  const rating = work.ratingDlsite || work.ratingFanza || 0;
                  const reviewCount =
                    work.reviewCountDlsite || work.reviewCountFanza || 0;
                  return (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-muted-foreground">
                        評価：
                      </span>
                      <span className="text-2xl font-bold text-red-500">
                        {rating.toFixed(2)}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              fill={
                                star <= Math.round(rating)
                                  ? "#f59e0b"
                                  : "#e5e7eb"
                              }
                              stroke="#ea580c"
                              strokeWidth="0.5"
                            />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({reviewCount.toLocaleString()})
                      </span>
                    </div>
                  );
                })()}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {work.title}
            </h1>

            {/* サークル */}
            {work.circleName && (
              <p>
                <Link
                  href={`/circles/${encodeURIComponent(work.circleName)}`}
                  className="text-accent hover:underline"
                >
                  {work.circleName}
                </Link>
              </p>
            )}

            {/* 声優（CVへのリンク） */}
            {work.actors.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">出演:</span>
                {work.actors.map((actor) => (
                  <Link key={actor} href={`/cv/${encodeURIComponent(actor)}`}>
                    <Badge variant="cv">{actor}</Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* タグ（タグページへのリンク） */}
            {work.aiTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {work.aiTags.map((tag) => (
                  <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                    <Badge
                      variant="tag"
                      className="cursor-pointer hover:opacity-80"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* 特集ページリンク */}
            {matchedFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-muted-foreground">関連特集:</span>
                {matchedFeatures.map((feature) => (
                  <Link key={feature.slug} href={`/feature/${feature.slug}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 border-primary/50 text-primary"
                    >
                      {feature.name}特集
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* サンプル画像ギャラリー */}
          {work.sampleImages.length > 1 && (
            <SampleImageGallery
              images={work.sampleImages.slice(1)}
              title={work.title}
            />
          )}

          {/* AIおすすめ理由 */}
          {work.aiRecommendReason && (
            <Card className="bg-secondary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  おすすめポイント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{work.aiRecommendReason}</p>
              </CardContent>
            </Card>
          )}

          {/* 要約 */}
          {work.aiSummary && (
            <Card className="bg-secondary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  要約
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{work.aiSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* どんな人に刺さるか */}
          {work.aiTargetAudience && (
            <Card className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  🎯 こんな人におすすめ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 dark:text-gray-200">
                  {work.aiTargetAudience}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 刺さりポイント */}
          {work.aiAppealPoints && (
            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  ✨ 刺さりポイント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 dark:text-gray-200">
                  {work.aiAppealPoints}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 注意点・地雷になりやすい人 */}
          {work.aiWarnings && (
            <Card className="bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  ⚠️ 注意点
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 dark:text-gray-200">
                  {work.aiWarnings}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 2d-adb編集部レビュー */}
          {work.aiReview && (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  📝 2d-adb編集部レビュー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {work.aiReview}
                </p>
              </CardContent>
            </Card>
          )}

          {/* スペック表（キラーワード） */}
          <SpecTable work={work} />

          {/* 評価サマリー */}
          {(work.ratingDlsite || work.ratingFanza) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  ⭐ ユーザー評価
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {work.ratingDlsite && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">DLsite:</span>
                      <span className="text-xl font-bold text-yellow-500">
                        ★ {work.ratingDlsite.toFixed(1)}
                      </span>
                      {work.reviewCountDlsite && (
                        <span className="text-sm text-muted-foreground">
                          ({work.reviewCountDlsite}件)
                        </span>
                      )}
                    </div>
                  )}
                  {work.ratingFanza && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">FANZA:</span>
                      <span className="text-xl font-bold text-yellow-500">
                        ★ {work.ratingFanza.toFixed(1)}
                      </span>
                      {work.reviewCountFanza && (
                        <span className="text-sm text-muted-foreground">
                          ({work.reviewCountFanza}件)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* セール終了カウントダウン（DLsite優先、なければFANZA） */}
          {isOnSale && (work.saleEndDateDlsite || work.saleEndDateFanza) && (
            <SaleTimer
              endDate={(work.saleEndDateDlsite || work.saleEndDateFanza)!}
              discountRate={work.maxDiscountRate}
            />
          )}

          {/* 購入後押しバナー（価格テーブル直前） */}
          {(work.aiAppealPoints || work.aiRecommendReason) && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-1">
                💡 買う前にチェック
              </p>
              <p className="text-sm text-amber-900 dark:text-amber-100">
                {work.aiAppealPoints || work.aiRecommendReason}
              </p>
            </div>
          )}

          {/* 価格比較テーブル */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-muted-foreground">
                      <span className="hidden sm:inline">プラットフォーム</span>
                      <span className="sm:hidden">販売</span>
                    </th>
                    <th className="flex px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-muted-foreground justify-center">
                      価格
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-medium text-muted-foreground">
                      無料版あり
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {work.priceDlsite && (
                    <tr className={`border-t border-border ${hasBothPrices && cheaperPlatform === "DLsite" ? "bg-emerald-50 dark:bg-emerald-950/50" : ""}`}>
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">
                            DLsite
                          </span>
                          {hasBothPrices && cheaperPlatform === "DLsite" && (
                            <Badge
                              variant="outline"
                              className="w-fit text-[10px] border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            >
                              最安
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-right">
                        <div className="flex items-end justify-center gap-4">
                          <div>
                            {work.discountRateDlsite &&
                              work.discountRateDlsite > 0 && (
                                <p className="text-[10px] text-muted-foreground line-through">
                                  {formatPrice(work.priceDlsite)}
                                </p>
                              )}
                            <p
                              className={`text-lg font-bold sm:text-xl ${work.discountRateDlsite && work.discountRateDlsite > 0 ? "text-red-500" : "text-foreground"}`}
                            >
                              {formatPrice(
                                dlsiteFinalPrice || work.priceDlsite,
                              )}
                            </p>
                          </div>

                          <div className="flex items-end gap-1.5 justify-center mb-1">
                            {work.discountRateDlsite &&
                              work.discountRateDlsite > 0 && (
                                <Badge
                                  variant="sale"
                                  className="text-[9px] px-1"
                                >
                                  {work.discountRateDlsite}%OFF
                                </Badge>
                              )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        {work.dlsiteUrl ? (
                          <Button
                            size="sm"
                            asChild
                            className={`font-bold ${work.discountRateDlsite && work.discountRateDlsite > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
                          >
                            <a
                              href={work.dlsiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {getCtaLabel(work.category)}
                            </a>
                          </Button>
                        ) : (
                          <Button size="sm" disabled className="font-bold">
                            {getCtaLabel(work.category)}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )}
                  {work.priceFanza && (
                    <tr className={`border-t border-border ${hasBothPrices && cheaperPlatform === "FANZA" ? "bg-emerald-50 dark:bg-emerald-950/50" : ""}`}>
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">
                            FANZA
                          </span>
                          {hasBothPrices && cheaperPlatform === "FANZA" && (
                            <Badge
                              variant="outline"
                              className="w-fit text-[10px] border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            >
                              最安
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-right">
                        <div className="flex items-end justify-center gap-4">
                          <div>
                            {work.discountRateFanza &&
                              work.discountRateFanza > 0 && (
                                <p className="text-[10px] text-muted-foreground line-through">
                                  {formatPrice(work.priceFanza)}
                                </p>
                              )}
                            <p
                              className={`text-lg font-bold sm:text-xl ${work.discountRateFanza && work.discountRateFanza > 0 ? "text-red-500" : "text-foreground"}`}
                            >
                              {formatPrice(fanzaFinalPrice || work.priceFanza)}
                            </p>
                          </div>

                          <div className="flex items-end gap-1.5 justify-center mb-1">
                            {work.discountRateFanza &&
                              work.discountRateFanza > 0 && (
                                <Badge
                                  variant="sale"
                                  className="text-[9px] px-1"
                                >
                                  {work.discountRateFanza}%OFF
                                </Badge>
                              )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        {work.fanzaUrl ? (
                          <Button
                            size="sm"
                            asChild
                            className={`font-bold ${work.discountRateFanza && work.discountRateFanza > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
                          >
                            <a
                              href={work.fanzaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {getCtaLabel(work.category)}
                            </a>
                          </Button>
                        ) : (
                          <Button size="sm" disabled className="font-bold">
                            {getCtaLabel(work.category)}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* 発売日 */}
          {work.releaseDate && (
            <p className="text-sm text-muted-foreground">
              発売日: {work.releaseDate}
            </p>
          )}

          {/* こちらもおすすめ */}
          {relatedWorks.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-foreground">
                こちらもおすすめ
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {relatedWorks.map((relatedWork) => (
                  <WorkCard key={relatedWork.id} work={relatedWork} />
                ))}
              </div>
            </section>
          )}

          {/* 特集ページバナー */}
          {allFeatures.length > 0 && (
            <section className="mt-10 space-y-3">
              <h2 className="text-lg font-bold text-foreground">特集ページ</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {allFeatures.map((feature) => (
                  <Link key={feature.slug} href={`/feature/${feature.slug}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all bg-card">
                      {feature.thumbnail_url && (
                        <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={feature.thumbnail_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-purple-500">{feature.name}特集</span>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {feature.headline || `${feature.name}作品を厳選`}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      {/* スマホ固定購入ボタン */}
      <FixedPurchaseCta
        priceDlsite={dlsiteFinalPrice}
        priceFanza={fanzaFinalPrice}
        originalPriceDlsite={work.priceDlsite}
        originalPriceFanza={work.priceFanza}
        dlsiteUrl={work.dlsiteUrl}
        fanzaUrl={work.fanzaUrl}
        discountRateDlsite={work.discountRateDlsite}
        discountRateFanza={work.discountRateFanza}
        saleEndDateDlsite={work.saleEndDateDlsite}
        saleEndDateFanza={work.saleEndDateFanza}
        category={work.category}
      />
    </div>
  );
}
