import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FeaturedBanners } from "@/components/featured-banners";
import {
  getAllVoiceActorFeatures,
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
} from "@/lib/db";
import {
  Mic,
  Star,
  TrendingUp,
  Sparkles,
  Tag,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "人気声優特集一覧 - おすすめASMR厳選 | 2D-ADB",
  description:
    "人気声優のASMR作品特集一覧。各声優のおすすめ作品を厳選して紹介。迷ったらここから選べばハズレなし。",
  openGraph: {
    title: "人気声優特集一覧 - おすすめASMR厳選 | 2D-ADB",
    description:
      "人気声優のASMR作品特集一覧。各声優のおすすめ作品を厳選して紹介。迷ったらここから選べばハズレなし。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "人気声優特集一覧 - おすすめASMR厳選 | 2D-ADB",
    description:
      "人気声優のASMR作品特集一覧。各声優のおすすめ作品を厳選して紹介。迷ったらここから選べばハズレなし。",
  },
};

export default async function CVTokushuListPage() {
  const [allFeatures, saleFeature, recommendation] = await Promise.all([
    getAllVoiceActorFeatures(),
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
  ]);

  const recommendationFirstWorkId =
    recommendation?.asmr_works?.[0]?.work_id ||
    recommendation?.game_works?.[0]?.work_id;

  const [saleFeatureMainWork, recommendationFirstWork] = await Promise.all([
    saleFeature?.main_work_id ? getWorkById(saleFeature.main_work_id) : null,
    recommendationFirstWorkId ? getWorkById(recommendationFirstWorkId) : null,
  ]);

  const saleThumbnail = saleFeatureMainWork?.thumbnail_url || null;
  const saleTargetDate = saleFeature?.target_date;
  const mainWorkSaleEndDate =
    saleFeatureMainWork?.sale_end_date_dlsite ||
    saleFeatureMainWork?.sale_end_date_fanza;
  const saleMaxDiscountRate = saleFeature?.max_discount_rate;
  const recommendationThumbnail = recommendationFirstWork?.thumbnail_url || null;
  const recommendationDate = recommendation?.target_date;

  // DLsiteとFANZAで分ける
  const dlsiteFeatures = allFeatures.filter((f) => f.platform === "dlsite");
  const fanzaFeatures = allFeatures.filter((f) => f.platform === "fanza");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <Breadcrumb
          items={[{ label: "トップ", href: "/" }, { label: "声優特集一覧" }]}
        />

        {/* ヘッダー */}
        <div className="mb-6 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 text-white">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                人気声優特集一覧
              </h1>
              <p className="text-sm text-muted-foreground">
                {allFeatures.length}人の人気声優を特集
              </p>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-bold text-purple-600">
                声優特集とは
              </span>
            </div>
            <p className="text-sm text-foreground">
              人気声優の作品から厳選したおすすめを紹介。
              <br />
              声優名をタップして、その声優のおすすめ作品をチェック！
            </p>
          </div>
        </div>

        {/* DLsite声優特集 */}
        {dlsiteFeatures.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-blue-500 text-white">
                DLsite
              </Badge>
              <h2 className="text-lg font-bold text-foreground">
                DLsite人気声優
              </h2>
              <Badge variant="outline" className="text-xs">
                {dlsiteFeatures.length}人
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {dlsiteFeatures.map((feature) => (
                <Link
                  key={feature.name}
                  href={`/tokushu/cv/${encodeURIComponent(feature.name)}`}
                >
                  <Card className="overflow-hidden border border-border hover:border-purple-500/50 transition-all">
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={
                          feature.representative_thumbnail_url ||
                          "https://placehold.co/200x112/f4f4f5/71717a?text=CV"
                        }
                        alt={feature.name}
                        className="h-full w-full object-cover"
                      />
                      {feature.sale_count > 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="sale" className="text-xs">
                            セール中
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-foreground truncate">
                        {feature.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Tag className="h-3 w-3 mr-0.5" />
                          {feature.total_work_count}作品
                        </span>
                        {feature.avg_rating && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Star className="h-3 w-3 mr-0.5 fill-amber-400 text-amber-400" />
                            {feature.avg_rating.toFixed(1)}
                          </span>
                        )}
                        {feature.sale_count > 0 && (
                          <span className="text-xs text-sale flex items-center">
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                            {feature.sale_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FANZA声優特集 */}
        {fanzaFeatures.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-orange-500 text-white">
                FANZA
              </Badge>
              <h2 className="text-lg font-bold text-foreground">
                FANZA人気声優
              </h2>
              <Badge variant="outline" className="text-xs">
                {fanzaFeatures.length}人
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {fanzaFeatures.map((feature) => (
                <Link
                  key={feature.name}
                  href={`/tokushu/cv/${encodeURIComponent(feature.name)}`}
                >
                  <Card className="overflow-hidden border border-border hover:border-purple-500/50 transition-all">
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={
                          feature.representative_thumbnail_url ||
                          "https://placehold.co/200x112/f4f4f5/71717a?text=CV"
                        }
                        alt={feature.name}
                        className="h-full w-full object-cover"
                      />
                      {feature.sale_count > 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="sale" className="text-xs">
                            セール中
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-foreground truncate">
                        {feature.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Tag className="h-3 w-3 mr-0.5" />
                          {feature.total_work_count}作品
                        </span>
                        {feature.avg_rating && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Star className="h-3 w-3 mr-0.5 fill-amber-400 text-amber-400" />
                            {feature.avg_rating.toFixed(1)}
                          </span>
                        )}
                        {feature.sale_count > 0 && (
                          <span className="text-xs text-sale flex items-center">
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                            {feature.sale_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
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
