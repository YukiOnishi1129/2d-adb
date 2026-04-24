import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FeaturedBanners } from "@/components/featured-banners";
import { CVListContent } from "@/components/cv-list-content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getActors,
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
  getWorksByIds,
  getVoiceRankingWorks,
  getAllVoiceActorFeatures,
} from "@/lib/db";
import { dbActorToActor } from "@/lib/types";
import { Mic, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "声優一覧 | 2D-ADB",
  description: "ASMR・同人音声・同人ゲームの人気声優一覧。声優から作品を探せます。",
  alternates: { canonical: "/cv/" },
};

export const dynamic = "force-static";

export default async function CVListPage() {
  const [dbActors, saleFeature, dailyRecommendation, dbVoiceRanking, voiceActorFeatures] =
    await Promise.all([
      getActors(),
      getLatestSaleFeature(),
      getLatestDailyRecommendation(),
      getVoiceRankingWorks(1),
      getAllVoiceActorFeatures(),
    ]);

  const actors = dbActors.map(dbActorToActor);

  // セール特集のメイン作品のサムネイルを取得
  const saleFeatureMainWork = saleFeature?.main_work_id
    ? await getWorkById(saleFeature.main_work_id)
    : null;

  // おすすめのASMR1位作品のサムネイルを取得
  const recommendationWorkIds = dailyRecommendation?.asmr_works?.[0]?.work_id
    ? [dailyRecommendation.asmr_works[0].work_id]
    : [];
  const recommendationWorks =
    recommendationWorkIds.length > 0
      ? await getWorksByIds(recommendationWorkIds)
      : [];

  // バナー用データ
  const saleThumbnail =
    saleFeatureMainWork?.thumbnail_url || dbVoiceRanking[0]?.thumbnail_url;
  const saleTargetDate = saleFeature?.target_date;
  const mainWorkSaleEndDate =
    saleFeatureMainWork?.sale_end_date_dlsite ||
    saleFeatureMainWork?.sale_end_date_fanza;
  const recommendationThumbnail =
    recommendationWorks[0]?.thumbnail_url || dbVoiceRanking[0]?.thumbnail_url;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {/* バナー */}
        <FeaturedBanners
          saleThumbnail={saleThumbnail}
          saleMaxDiscountRate={saleFeature?.max_discount_rate}
          saleTargetDate={saleTargetDate}
          mainWorkSaleEndDate={mainWorkSaleEndDate}
          recommendationThumbnail={recommendationThumbnail}
          recommendationDate={dailyRecommendation?.target_date}
        />

        {/* 声優特集への導線 */}
        {voiceActorFeatures.length > 0 && (
          <Link href="/tokushu/cv">
            <Card className="mb-6 overflow-hidden border border-pink-500/30 hover:border-pink-500/50 transition-all">
              {voiceActorFeatures[0]?.representative_thumbnail_url ? (
                <div className="relative aspect-[21/9] overflow-hidden">
                  <img
                    src={voiceActorFeatures[0].representative_thumbnail_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* 上下グラデーション */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent" />
                  {/* ラベル */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-sm font-bold text-white bg-pink-500" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                    🎤 人気声優特集
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-white mb-1" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                          人気声優のおすすめ作品を厳選紹介
                        </p>
                        <p className="text-sm text-white/80" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                          {voiceActorFeatures.length}人の人気声優を特集中
                        </p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-white shrink-0" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-500/20 shrink-0">
                    <Mic className="h-6 w-6 text-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Mic className="h-4 w-4 text-pink-500" />
                      <span className="text-sm font-bold text-pink-500">人気声優特集</span>
                      <Badge variant="outline" className="text-xs">
                        {voiceActorFeatures.length}人
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      人気声優のおすすめ作品を厳選紹介
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-pink-500 shrink-0" />
                </div>
              )}
            </Card>
          </Link>
        )}

        <CVListContent actors={actors} />
      </main>

      <Footer />
    </div>
  );
}
