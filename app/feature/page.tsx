import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  getAllFeatures,
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
  getAllVoiceActorFeatures,
} from "@/lib/db";
import type { Metadata } from "next";
import {
  Sparkles,
  Headphones,
  Gamepad2,
  ChevronRight,
  Mic,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { FeaturedBanners } from "@/components/featured-banners";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "性癖・ジャンル特集一覧 | 2D-ADB",
  description:
    "乳首責め、オナサポ、寝取られ、催眠など、性癖・ジャンル別の厳選作品特集一覧。ASMRとゲームのおすすめ作品をまとめて紹介。",
  openGraph: {
    title: "性癖・ジャンル特集一覧 | 2D-ADB",
    description:
      "乳首責め、オナサポ、寝取られ、催眠など、性癖・ジャンル別の厳選作品特集一覧。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "性癖・ジャンル特集一覧 | 2D-ADB",
    description:
      "乳首責め、オナサポ、寝取られ、催眠など、性癖・ジャンル別の厳選作品特集一覧。",
  },
};

// 特集カード
function FeatureCard({
  slug,
  name,
  headline,
  description,
  asmrCount,
  gameCount,
  thumbnailUrl,
  updatedAt,
}: {
  slug: string;
  name: string;
  headline: string | null;
  description: string | null;
  asmrCount: number;
  gameCount: number;
  thumbnailUrl: string | null;
  updatedAt: string;
}) {
  const formatUpdatedAt = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Link href={`/feature/${slug}`}>
      <Card className="overflow-hidden border border-border hover:border-primary/50 transition-all">
        <div className="flex gap-4 p-4">
          {/* サムネイル */}
          {thumbnailUrl && (
            <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
              <img
                src={thumbnailUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* 情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-4 w-4 text-amber-500" />
              <h2 className="text-base font-bold text-foreground">{name}</h2>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {headline || description || `${name}作品の厳選リスト`}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {asmrCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Headphones className="h-3 w-3 mr-1" />
                  ASMR {asmrCount}作品
                </Badge>
              )}
              {gameCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Gamepad2 className="h-3 w-3 mr-1" />
                  ゲーム {gameCount}作品
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatUpdatedAt(updatedAt)} 更新
              </span>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
        </div>
      </Card>
    </Link>
  );
}

export default async function FeatureListPage() {
  const [features, saleFeature, recommendation, voiceActorFeatures] =
    await Promise.all([
      getAllFeatures(),
      getLatestSaleFeature(),
      getLatestDailyRecommendation(),
      getAllVoiceActorFeatures(),
    ]);

  // セール特集のメイン作品と編集部おすすめの1位作品を取得
  const recommendationFirstWorkId =
    recommendation?.asmr_works?.[0]?.work_id ||
    recommendation?.game_works?.[0]?.work_id;
  const [saleFeatureMainWork, recommendationFirstWork] = await Promise.all([
    saleFeature?.main_work_id ? getWorkById(saleFeature.main_work_id) : null,
    recommendationFirstWorkId ? getWorkById(recommendationFirstWorkId) : null,
  ]);

  // セール特集用データ
  const saleThumbnail = saleFeatureMainWork?.thumbnail_url || null;
  const saleTargetDate = saleFeature?.target_date;
  const mainWorkSaleEndDate =
    saleFeatureMainWork?.sale_end_date_dlsite ||
    saleFeatureMainWork?.sale_end_date_fanza;
  const saleMaxDiscountRate = saleFeature?.max_discount_rate;

  // 編集部おすすめ用データ
  const recommendationThumbnail = recommendationFirstWork?.thumbnail_url || null;
  const recommendationDate = recommendation?.target_date;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {/* パンくずリスト */}
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "特集一覧" },
          ]}
        />

        {/* ページヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-bold text-foreground">
              性癖・ジャンル特集一覧
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            各ジャンルの厳選作品をASMR・ゲーム別にまとめて紹介
          </p>
        </div>

        {/* 特集一覧 */}
        <section className="mb-8">
          <div className="grid gap-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.slug}
                slug={feature.slug}
                name={feature.name}
                headline={feature.headline}
                description={feature.description}
                asmrCount={feature.asmr_count || 0}
                gameCount={feature.game_count || 0}
                thumbnailUrl={feature.thumbnail_url}
                updatedAt={feature.updated_at}
              />
            ))}
          </div>
        </section>

        {/* 声優特集バナー */}
        {voiceActorFeatures.length > 0 && (
          <section className="mt-10 space-y-3">
            <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <Mic className="h-4 w-4 text-pink-500" />
              人気声優特集
            </h3>
            <div className="grid gap-3">
              {voiceActorFeatures.slice(0, 5).map((va) => (
                <Link
                  key={va.name}
                  href={`/tokushu/cv/${encodeURIComponent(va.name)}`}
                >
                  <Card className="overflow-hidden border border-pink-500/30 hover:border-pink-500/50 transition-all">
                    <div className="flex items-center gap-4 p-4">
                      {va.representative_thumbnail_url && (
                        <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden">
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
                          <span className="text-sm font-bold text-foreground">
                            {va.name}
                          </span>
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
            features={[]}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
