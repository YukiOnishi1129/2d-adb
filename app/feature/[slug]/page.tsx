import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
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
  getAllVoiceActorFeatures,
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
  Mic,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeaturedBanners } from "@/components/featured-banners";
import { AffiliateLink } from "@/components/affiliate-link";

export const dynamic = "force-static";

// 静的パラメータを生成
export async function generateStaticParams() {
  const slugs = await getAllFeatureSlugs();
  return slugs.map((slug) => ({ slug }));
}

// SEO用のキーワードマッピング
const FEATURE_SEO_DATA: Record<string, { keywords: string[]; relatedTerms: string[] }> = {
  nipple: {
    keywords: ["乳首責め", "乳首", "ASMR", "おすすめ", "同人音声"],
    relatedTerms: ["乳首舐め", "乳首コリコリ", "乳首攻め", "乳首開発"],
  },
  edging: {
    keywords: ["射精管理", "寸止め", "ASMR", "おすすめ", "同人音声"],
    relatedTerms: ["焦らし", "オーガズムコントロール", "射精禁止"],
  },
  onasapo: {
    keywords: ["オナサポ", "オナニーサポート", "ASMR", "おすすめ", "同人音声"],
    relatedTerms: ["オナニー指示", "手コキ音声", "射精カウントダウン"],
  },
  hypnosis: {
    keywords: ["催眠音声", "催眠", "ASMR", "おすすめ", "同人音声"],
    relatedTerms: ["洗脳", "暗示", "トランス", "催眠オナニー"],
  },
  earlick: {
    keywords: ["耳舐め", "耳", "ASMR", "おすすめ", "同人音声"],
    relatedTerms: ["耳かき", "耳元囁き", "バイノーラル"],
  },
  ntr: {
    keywords: ["NTR", "寝取られ", "ASMR", "おすすめ", "同人音声"],
    relatedTerms: ["寝取り", "浮気", "間男"],
  },
  succubus: {
    keywords: ["サキュバス", "淫魔", "ASMR", "おすすめ", "同人音声"],
    relatedTerms: ["夢魔", "搾精", "魅了"],
  },
  maid: {
    keywords: ["メイド", "ご主人様", "ASMR", "おすすめ", "同人音声"],
    relatedTerms: ["奉仕", "お世話", "従順"],
  },
};

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

  const seoData = FEATURE_SEO_DATA[slug];
  const totalWorks = (feature.asmr_count || 0) + (feature.game_count || 0);
  const year = new Date().getFullYear();

  // SEO最適化されたタイトル
  const title = `【${year}年】${feature.name}ASMRおすすめ${totalWorks}選｜同人音声・ゲーム厳選 | 2D-ADB`;

  // SEO最適化されたdescription（120-160文字目安）
  const description = `${feature.name}好きにおすすめのASMR・同人音声・同人ゲームを厳選${totalWorks}作品紹介。${
    feature.headline || `${feature.name}ジャンルで評価の高い作品`
  }をランキング形式で掲載。DLsite・FANZAのセール情報も随時更新中。`;

  const ogImage = feature.thumbnail_url || undefined;
  const keywords = seoData?.keywords.join(", ") || `${feature.name}, ASMR, おすすめ, 同人音声`;

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
            <AffiliateLink
              platform={work.dlsiteProductId ? "dlsite" : "fanza"}
              url={sampleUrl}
              workId={work.id}
              size="sm"
              className="flex-1 w-full text-xs font-bold"
            >
              <Play className="h-3 w-3 mr-1" />
              {isASMR ? "試聴してみる" : "体験版で遊ぶ"}
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

  const [asmrDbWorks, gameDbWorks, saleFeature, recommendation, allFeatures, voiceActorFeatures] = await Promise.all([
    getWorksByIds(asmrWorkIds),
    getWorksByIds(gameWorkIds),
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
    getAllFeatures(),
    getAllVoiceActorFeatures(),
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

  // 全作品を結合してランキング用に
  const allWorks = [...asmrWorks, ...gameWorks];

  // JSON-LD構造化データ（ItemList）
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${feature.name}ASMRおすすめランキング`,
    description: `${feature.name}好きにおすすめのASMR・同人音声・同人ゲーム厳選${allWorks.length}作品`,
    numberOfItems: allWorks.length,
    itemListElement: allWorks.slice(0, 10).map((work, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: work.title,
      url: `https://2d-adb.com/works/${work.id}`,
    })),
  };

  // JSON-LD構造化データ（FAQPage）
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${feature.name}ASMRでおすすめの作品は？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${feature.name}ASMRでおすすめの作品は、${allWorks[0]?.title || "当サイトのランキング上位作品"}です。レビュー評価が高く、購入者からの評判も良い作品を厳選しています。`,
        },
      },
      {
        "@type": "Question",
        name: `${feature.name}作品はどこで買える？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${feature.name}作品はDLsiteやFANZAで購入できます。当サイトではセール情報も随時更新しているので、お得に購入するタイミングもチェックできます。`,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {/* パンくずリスト */}
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "特集一覧", href: "/feature" },
            { label: `${feature.name}特集` },
          ]}
        />

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

        {/* SEO用リード文セクション */}
        <section className="mb-8 p-4 bg-card rounded-lg border border-border">
          <h2 className="text-base font-bold text-foreground mb-3">
            {feature.name}ASMRとは？
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              「{feature.name}」ジャンルのASMR・同人音声は、{feature.name}好きにはたまらない刺激的な体験を提供してくれます。
              本ページでは、DLsite・FANZAで販売されている{feature.name}作品の中から、
              <strong className="text-foreground">レビュー評価が高く、購入者から特に好評</strong>な作品を厳選してご紹介しています。
            </p>
            <p>
              「ハズレを引きたくない」「どれを買えばいいか迷っている」という方は、
              まずは上位ランキングの作品から試してみてください。
              セール中の作品も随時更新しているので、お得に購入するチャンスもお見逃しなく。
            </p>
          </div>
          {FEATURE_SEO_DATA[slug]?.relatedTerms && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold">関連ワード: </span>
                {FEATURE_SEO_DATA[slug].relatedTerms.join("、")}
              </p>
            </div>
          )}
        </section>

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

        {/* 声優特集バナー */}
        {voiceActorFeatures.length > 0 && (
          <section className="mt-10 space-y-3">
            <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <Mic className="h-4 w-4 text-pink-500" />
              人気声優特集
            </h3>
            <div className="grid gap-3">
              {voiceActorFeatures.slice(0, 5).map((va) => (
                <Link key={va.name} href={`/tokushu/cv/${encodeURIComponent(va.name)}`}>
                  <Card className="overflow-hidden border border-pink-500/30 hover:border-pink-500/50 transition-all">
                    <div className="flex items-center gap-4 p-4">
                      {va.representative_thumbnail_url && (
                        <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={va.representative_thumbnail_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Mic className="h-3.5 w-3.5 text-pink-500" />
                          <span className="text-sm font-bold text-foreground">{va.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {va.headline || `${va.name}のおすすめ作品`}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-pink-500 shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 他のコンテンツへの誘導 */}
        <section className="mt-8">
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
