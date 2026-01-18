import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getVoiceActorFeatureByName,
  getAllVoiceActorFeatureNames,
  getWorksByIds,
  getWorksByActor,
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
  getAllVoiceActorFeatures,
} from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import type { Work } from "@/lib/types";
import {
  Star,
  Clock,
  Headphones,
  Play,
  ExternalLink,
  ThumbsUp,
  Users,
  Sparkles,
  ChevronRight,
  Mic,
  Tag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeaturedBanners } from "@/components/featured-banners";
import { AffiliateLink } from "@/components/affiliate-link";

interface Props {
  params: Promise<{ name: string }>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ name: string }[]> {
  try {
    const names = await getAllVoiceActorFeatureNames();
    console.log(`[CV Tokushu] generateStaticParams: ${names.length} featured actors found`);
    if (names.length === 0) {
      return [{ name: "__placeholder__" }];
    }
    return names.map((name) => ({ name }));
  } catch (error) {
    console.error("[CV Tokushu] Error in generateStaticParams:", error);
    return [{ name: "__placeholder__" }];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const feature = await getVoiceActorFeatureByName(decodedName);

  if (!feature) {
    return { title: "声優特集 | 2D-ADB" };
  }

  const title = `${feature.name}特集 - おすすめASMR厳選${feature.recommended_works?.length || 0}作品 | 2D-ADB`;
  const description = feature.description || `${feature.name}の人気ASMR作品を厳選。迷ったらここから選べばハズレなし。`;
  const ogImage = feature.representative_thumbnail_url || undefined;
  const keywords = [
    feature.name,
    `${feature.name} ASMR`,
    `${feature.name} おすすめ`,
    `${feature.name} 同人音声`,
    "ASMR",
    "同人音声",
    "声優",
    feature.platform === "dlsite" ? "DLsite" : "FANZA",
  ];

  return {
    title,
    description,
    keywords,
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

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

function getSampleUrl(work: Work): string | null {
  if (work.dlsiteProductId) {
    return `https://www.dlsite.com/maniax/work/=/product_id/${work.dlsiteProductId}.html`;
  }
  if (work.fanzaUrl) {
    return work.fanzaUrl;
  }
  return null;
}

function RecommendationCard({
  work,
  reason,
  targetAudience,
  rank,
}: {
  work: Work;
  reason: string;
  targetAudience: string;
  rank: number;
}) {
  const rating = work.ratingDlsite || work.ratingFanza || 0;
  const reviewCount = work.reviewCountDlsite || work.reviewCountFanza || 0;
  const originalPrice = work.priceDlsite || work.priceFanza || 0;
  const salePrice = work.lowestPrice || originalPrice;
  const sampleUrl = getSampleUrl(work);

  return (
    <Card className="overflow-hidden border border-border hover:border-primary/50 transition-all">
      <div className="p-4">
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
              <Headphones className="h-3 w-3 mr-1" />ASMR
            </Badge>
          </div>
          {work.isOnSale && work.maxDiscountRate && (
            <Badge variant="sale" className="text-xs">
              {work.maxDiscountRate}%OFF
            </Badge>
          )}
        </div>

        <Link href={`/works/${work.id}`}>
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted mb-3">
            <img
              src={work.thumbnailUrl || "https://placehold.co/400x225/f4f4f5/71717a?text=No"}
              alt={work.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            {work.killerWords.durationMinutes && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                <Clock className="h-3 w-3" />
                {work.killerWords.durationMinutes}分
              </div>
            )}
          </div>

          <h3 className="text-base font-bold line-clamp-2 text-foreground hover:text-primary transition-colors mb-2">
            {work.title}
          </h3>
        </Link>

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
              <span className="text-sm font-bold text-amber-500">{rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviewCount}件)</span>
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

        <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">おすすめポイント</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{reason}</p>
        </div>

        <div className="mb-3 p-3 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">こんな人におすすめ</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{targetAudience}</p>
        </div>

        <div className="flex gap-2">
          {sampleUrl && (
            <AffiliateLink
              platform={work.dlsiteProductId ? "dlsite" : "fanza"}
              url={sampleUrl}
              workId={work.id}
              size="sm"
              className="flex-1 w-full text-xs font-bold"
            >
              <Play className="h-3 w-3 mr-1" />
              試聴してみる
              <ExternalLink className="h-3 w-3 ml-1" />
            </AffiliateLink>
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

function SaleWorkCard({ work }: { work: Work }) {
  return (
    <Link href={`/works/${work.id}`} className="block">
      <Card className="overflow-hidden border border-border hover:border-sale/50 transition-all">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={work.thumbnailUrl || "https://placehold.co/200x150/f4f4f5/71717a?text=No"}
            alt={work.title}
            className="h-full w-full object-cover"
          />
          {work.maxDiscountRate && (
            <div className="absolute top-2 right-2">
              <Badge variant="sale" className="text-xs font-bold">
                {work.maxDiscountRate}%OFF
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3">
          <h4 className="text-sm font-bold line-clamp-2 text-foreground mb-2">{work.title}</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-sale">
              {formatPrice(work.lowestPrice || 0)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function WorkCard({ work }: { work: Work }) {
  const price = work.lowestPrice || work.priceDlsite || work.priceFanza || 0;
  return (
    <Link href={`/works/${work.id}`} className="block">
      <Card className="overflow-hidden border border-border hover:border-green-500/50 transition-all">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={work.thumbnailUrl || "https://placehold.co/200x150/f4f4f5/71717a?text=No"}
            alt={work.title}
            className="h-full w-full object-cover"
          />
          {work.isOnSale && work.maxDiscountRate && (
            <div className="absolute top-2 right-2">
              <Badge variant="sale" className="text-xs font-bold">
                {work.maxDiscountRate}%OFF
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3">
          <h4 className="text-sm font-bold line-clamp-2 text-foreground mb-2">{work.title}</h4>
          <div className="flex items-baseline gap-2">
            <span className={`text-base font-bold ${work.isOnSale ? "text-sale" : "text-foreground"}`}>
              {formatPrice(price)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default async function CVTokushuPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const feature = await getVoiceActorFeatureByName(decodedName);

  if (!feature) {
    notFound();
  }

  const recommendedWorkIds = (feature.recommended_works || []).map(w => w.work_id);
  const saleWorkIds = (feature.sale_works || []).map(w => w.work_id);

  const [recommendedDbWorks, saleDbWorks, allActorDbWorks, saleFeature, recommendation, allActorFeatures] = await Promise.all([
    getWorksByIds(recommendedWorkIds),
    getWorksByIds(saleWorkIds),
    getWorksByActor(decodedName), // 全作品（新着順）
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
    getAllVoiceActorFeatures(),
  ]);

  const recommendationFirstWorkId = recommendation?.asmr_works?.[0]?.work_id || recommendation?.game_works?.[0]?.work_id;
  const [saleFeatureMainWork, recommendationFirstWork] = await Promise.all([
    saleFeature?.main_work_id ? getWorkById(saleFeature.main_work_id) : null,
    recommendationFirstWorkId ? getWorkById(recommendationFirstWorkId) : null,
  ]);

  const recommendedWorks = recommendedDbWorks.map(dbWorkToWork);
  const saleWorks = saleDbWorks.map(dbWorkToWork);

  // 新作（おすすめ・セールと重複しない作品を最大6件）
  const usedWorkIds = new Set([...recommendedWorkIds, ...saleWorkIds]);
  const newWorks = allActorDbWorks
    .filter(w => !usedWorkIds.has(w.id))
    .slice(0, 6)
    .map(dbWorkToWork);

  const recMap = new Map(
    (feature.recommended_works || []).map(r => [r.work_id, r])
  );

  const saleThumbnail = saleFeatureMainWork?.thumbnail_url || null;
  const saleTargetDate = saleFeature?.target_date;
  const mainWorkSaleEndDate = saleFeatureMainWork?.sale_end_date_dlsite || saleFeatureMainWork?.sale_end_date_fanza;
  const saleMaxDiscountRate = saleFeature?.max_discount_rate;
  const recommendationThumbnail = recommendationFirstWork?.thumbnail_url || null;
  const recommendationDate = recommendation?.target_date;

  const otherActorFeatures = allActorFeatures
    .filter(f => f.name !== feature.name)
    .slice(0, 6);

  const formatUpdatedAt = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "声優特集", href: "/tokushu/cv" },
            { label: feature.name },
          ]}
        />

        {/* ヘッダー */}
        <div className="mb-6 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 text-white">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{feature.name}</h1>
              <p className="text-sm text-muted-foreground">
                {feature.platform === "dlsite" ? "DLsite" : "FANZA"}で人気の声優
              </p>
            </div>
          </div>

          {/* 統計バッジ */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              全{feature.total_work_count}作品
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Mic className="h-3 w-3 mr-1" />
              単独{feature.solo_work_count}作品
            </Badge>
            {feature.avg_rating && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                平均★{feature.avg_rating.toFixed(1)}
              </Badge>
            )}
            {feature.sale_count > 0 && (
              <Badge variant="sale" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {feature.sale_count}作品セール中
              </Badge>
            )}
          </div>

          {/* ヘッドライン */}
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-bold text-purple-600">今週のおすすめ</span>
            </div>
            <p className="text-base font-bold text-foreground">
              {feature.headline || `${feature.name}のASMR、厳選おすすめ`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {feature.description || `${feature.name}の作品から迷ったらこれを選べ。`}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatUpdatedAt(feature.updated_at)} 更新
            </p>
          </div>
        </div>

        {/* おすすめ作品 */}
        {recommendedWorks.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ThumbsUp className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-bold text-foreground">厳選おすすめ</h2>
              <Badge variant="secondary" className="text-xs">
                {recommendedWorks.length}作品
              </Badge>
            </div>
            <div className="grid gap-4">
              {recommendedWorks.map((work, index) => {
                const rec = recMap.get(work.id);
                return (
                  <RecommendationCard
                    key={work.id}
                    work={work}
                    reason={rec?.reason || work.aiRecommendReason || "人気の作品です"}
                    targetAudience={rec?.target_audience || work.aiTargetAudience || "この作品に興味がある人"}
                    rank={index + 1}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* セール中の作品 */}
        {saleWorks.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-sale" />
              <h2 className="text-lg font-bold text-foreground">{feature.name}のセール中作品</h2>
              <Badge variant="sale" className="text-xs">
                {saleWorks.length}作品
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {saleWorks.map((work) => (
                <SaleWorkCard key={work.id} work={work} />
              ))}
            </div>
          </section>
        )}

        {/* 新作 */}
        {newWorks.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-bold text-foreground">🆕 {feature.name}の最新作</h2>
              <Badge variant="secondary" className="text-xs">
                {newWorks.length}作品
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {newWorks.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          </section>
        )}

        {/* この声優の全作品を見る */}
        <div className="mt-8 mb-10">
          <Link href={`/cv/${encodeURIComponent(feature.name)}`}>
            <Card className="overflow-hidden border-2 border-purple-500 hover:border-purple-400 transition-all bg-gradient-to-r from-purple-500/10 to-pink-500/5">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 text-white">
                    <Mic className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">
                      {feature.name}の全{feature.total_work_count}作品を見る
                    </p>
                    <p className="text-sm text-muted-foreground">
                      出演作品を一覧表示
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-purple-500 font-bold">
                  <span className="text-sm hidden sm:inline">一覧</span>
                  <ChevronRight className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* 他の人気声優特集 */}
        {otherActorFeatures.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-bold text-foreground">他の人気声優特集</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {otherActorFeatures.map((actor) => (
                <Link key={actor.name} href={`/tokushu/cv/${encodeURIComponent(actor.name)}`}>
                  <Card className="overflow-hidden border border-border hover:border-purple-500/50 transition-all">
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={actor.representative_thumbnail_url || "https://placehold.co/200x112/f4f4f5/71717a?text=CV"}
                        alt={actor.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-foreground truncate">{actor.name}</p>
                      <p className="text-xs text-muted-foreground">{actor.total_work_count}作品</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/tokushu/cv">
                <Button variant="outline" size="sm">
                  全ての声優特集を見る
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* 他のコンテンツへの誘導 */}
        <section className="mt-10">
          <FeaturedBanners
            saleThumbnail={saleThumbnail}
            saleMaxDiscountRate={saleMaxDiscountRate}
            saleTargetDate={saleTargetDate}
            mainWorkSaleEndDate={mainWorkSaleEndDate}
            recommendationThumbnail={recommendationThumbnail}
            recommendationDate={recommendationDate}
            features={[]}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
