import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getFeatureBySlug,
  getAllFeatureSlugs,
  getAllFeatures,
  getWorksByIds,
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
} from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import type { Work } from "@/lib/types";
import type { Metadata } from "next";
import {
  Star,
  Clock,
  Headphones,
  Gamepad2,
  Play,
  ExternalLink,
  ThumbsUp,
  Users,
  Sparkles,
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeaturedBanners } from "@/components/featured-banners";

export const dynamic = "force-static";

// 静的パラメータを生成
export async function generateStaticParams() {
  const slugs = await getAllFeatureSlugs();
  return slugs.map((slug) => ({ slug }));
}

// メタデータを動的生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const feature = await getFeatureBySlug(slug);
  if (!feature) {
    return { title: "特集ページ | 2D-ADB" };
  }

  const title = `${feature.name}特集 | 2D-ADB`;
  const description = feature.description || `${feature.name}作品の厳選リスト`;
  const ogImage = feature.thumbnail_url || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

// 価格フォーマット
function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

// 試聴/体験版URLを取得
function getSampleUrl(work: Work): string | null {
  if (work.dlsiteProductId) {
    return `https://www.dlsite.com/maniax/work/=/product_id/${work.dlsiteProductId}.html`;
  }
  if (work.fanzaUrl) {
    return work.fanzaUrl;
  }
  return null;
}

// おすすめカード
function RecommendationCard({
  work,
  reason,
  targetAudience,
  rank,
  isASMR,
}: {
  work: Work;
  reason: string;
  targetAudience: string;
  rank: number;
  isASMR: boolean;
}) {
  const rating = work.ratingDlsite || work.ratingFanza || 0;
  const reviewCount = work.reviewCountDlsite || work.reviewCountFanza || 0;
  const originalPrice = work.priceDlsite || work.priceFanza || 0;
  const salePrice = work.lowestPrice || originalPrice;
  const sampleUrl = getSampleUrl(work);

  return (
    <Card className="overflow-hidden border border-border hover:border-primary/50 transition-all">
      <div className="p-4">
        {/* ランクバッジ */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
              rank === 1 ? "bg-amber-500 text-white" :
              rank === 2 ? "bg-gray-400 text-white" :
              rank === 3 ? "bg-amber-700 text-white" :
              "bg-muted text-muted-foreground"
            }`}>
              {rank}
            </div>
            <Badge variant="secondary" className="text-xs">
              {isASMR ? (
                <><Headphones className="h-3 w-3 mr-1" />ASMR</>
              ) : (
                <><Gamepad2 className="h-3 w-3 mr-1" />ゲーム</>
              )}
            </Badge>
          </div>
          {work.isOnSale && work.maxDiscountRate && (
            <Badge variant="sale" className="text-xs">
              {work.maxDiscountRate}%OFF
            </Badge>
          )}
        </div>

        <Link href={`/works/${work.id}`}>
          {/* サムネイル */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted mb-3">
            <img
              src={
                work.thumbnailUrl ||
                "https://placehold.co/400x225/f4f4f5/71717a?text=No"
              }
              alt={work.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            {/* スペック */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              {work.killerWords.durationMinutes && (
                <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  <Clock className="h-3 w-3" />
                  {work.killerWords.durationMinutes}分
                </div>
              )}
              {work.killerWords.playTimeHours && (
                <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  <Clock className="h-3 w-3" />
                  {work.killerWords.playTimeHours}時間
                </div>
              )}
            </div>
          </div>

          {/* タイトル */}
          <h3 className="text-base font-bold line-clamp-2 text-foreground hover:text-primary transition-colors mb-2">
            {work.title}
          </h3>
        </Link>

        {/* 評価・価格 */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= Math.round(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-amber-500">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({reviewCount}件)
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            {work.isOnSale && work.maxDiscountRate && work.maxDiscountRate > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className={`text-lg font-bold ${work.isOnSale ? "text-sale" : "text-foreground"}`}>
              {formatPrice(salePrice)}
            </span>
          </div>
        </div>

        {/* おすすめ理由 */}
        <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">おすすめポイント</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {reason}
          </p>
        </div>

        {/* こんな人におすすめ */}
        <div className="mb-3 p-3 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">こんな人におすすめ</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {targetAudience}
          </p>
        </div>

        {/* ボタン */}
        <div className="flex gap-2">
          {sampleUrl && (
            <a
              href={sampleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                <Play className="h-3 w-3 mr-1" />
                {isASMR ? "試聴する" : "体験版"}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </a>
          )}
          <Link href={`/works/${work.id}`} className="flex-1">
            <Button size="sm" className="w-full bg-sale hover:bg-sale/90 text-white text-xs font-bold">
              詳細を見る
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

// カテゴリセクション
function CategorySection({
  title,
  icon: Icon,
  works,
  recommendations,
  isASMR,
}: {
  title: string;
  icon: typeof Headphones;
  works: Work[];
  recommendations: { work_id: number; reason: string; target_audience: string }[];
  isASMR: boolean;
}) {
  if (works.length === 0) return null;

  // work_idでrecommendationをマッピング
  const recMap = new Map(recommendations.map(r => [r.work_id, r]));

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${isASMR ? "text-purple-500" : "text-green-500"}`} />
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <Badge variant="secondary" className="text-xs">
          {works.length}作品
        </Badge>
      </div>
      <div className="grid gap-4">
        {works.map((work, index) => {
          const rec = recMap.get(work.id);
          return (
            <RecommendationCard
              key={work.id}
              work={work}
              reason={rec?.reason || work.aiRecommendReason || "人気の作品です"}
              targetAudience={rec?.target_audience || work.aiTargetAudience || "この作品に興味がある人"}
              rank={index + 1}
              isASMR={isASMR}
            />
          );
        })}
      </div>
    </section>
  );
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const feature = await getFeatureBySlug(slug);

  if (!feature) {
    notFound();
  }

  // 作品データを取得（各5件まで）
  const asmrWorkIds = (feature.asmr_works || []).slice(0, 5).map(w => w.work_id);
  const gameWorkIds = (feature.game_works || []).slice(0, 5).map(w => w.work_id);

  const [asmrDbWorks, gameDbWorks, saleFeature, recommendation, allFeatures] = await Promise.all([
    getWorksByIds(asmrWorkIds),
    getWorksByIds(gameWorkIds),
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
    getAllFeatures(),
  ]);

  // セール特集のメイン作品と編集部おすすめの1位作品を取得
  const recommendationFirstWorkId = recommendation?.asmr_works?.[0]?.work_id || recommendation?.game_works?.[0]?.work_id;
  const [saleFeatureMainWork, recommendationFirstWork] = await Promise.all([
    saleFeature?.main_work_id ? getWorkById(saleFeature.main_work_id) : null,
    recommendationFirstWorkId ? getWorkById(recommendationFirstWorkId) : null,
  ]);

  const asmrWorks = asmrDbWorks.map(dbWorkToWork);
  const gameWorks = gameDbWorks.map(dbWorkToWork);

  // セール特集用データ
  const saleThumbnail = saleFeatureMainWork?.thumbnail_url || null;
  const saleTargetDate = saleFeature?.target_date;
  const mainWorkSaleEndDate = saleFeatureMainWork?.sale_end_date_dlsite || saleFeatureMainWork?.sale_end_date_fanza;
  const saleMaxDiscountRate = saleFeature?.max_discount_rate;

  // 編集部おすすめ用データ
  const recommendationThumbnail = recommendationFirstWork?.thumbnail_url || null;
  const recommendationDate = recommendation?.target_date;

  // 他の特集ページ（自分自身を除外）
  const otherFeatures = allFeatures.filter(f => f.slug !== slug);

  // 更新日をフォーマット
  const formatUpdatedAt = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {/* ページヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-bold text-foreground">
              {feature.headline || `${feature.name}好きならこれ一択`}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {feature.description || `${feature.name}作品の中でもハズレなしの厳選10作品`}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            {formatUpdatedAt(feature.updated_at)} 更新
          </div>
        </div>

        {/* ASMR部門 */}
        <CategorySection
          title={`${feature.name}好きに刺さるASMR`}
          icon={Headphones}
          works={asmrWorks}
          recommendations={feature.asmr_works || []}
          isASMR={true}
        />

        {/* ゲーム部門 */}
        <CategorySection
          title={`${feature.name}好きにおすすめゲーム`}
          icon={Gamepad2}
          works={gameWorks}
          recommendations={feature.game_works || []}
          isASMR={false}
        />

        {/* このジャンルの作品をもっと見る */}
        <div className="mt-8 mb-10">
          <Link href={`/search?q=${encodeURIComponent(feature.name)}`}>
            <Card className="overflow-hidden border-2 border-primary hover:border-primary/80 transition-all bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">
                      「{feature.name}」の作品をもっと見る
                    </p>
                    <p className="text-sm text-muted-foreground">
                      検索ページで絞り込み・並び替え
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-bold">
                  <span className="text-sm hidden sm:inline">検索</span>
                  <ChevronRight className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* 他のコンテンツへの誘導 */}
        <section className="mt-10">
          <FeaturedBanners
            saleThumbnail={saleThumbnail}
            saleMaxDiscountRate={saleMaxDiscountRate}
            saleTargetDate={saleTargetDate}
            mainWorkSaleEndDate={mainWorkSaleEndDate}
            recommendationThumbnail={recommendationThumbnail}
            recommendationDate={recommendationDate}
            features={otherFeatures}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
