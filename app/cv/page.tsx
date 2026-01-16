import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FeaturedBanners } from "@/components/featured-banners";
import { CVListContent } from "@/components/cv-list-content";
import {
  getActors,
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
  getWorksByIds,
  getVoiceRankingWorks,
} from "@/lib/db";
import { dbActorToActor } from "@/lib/types";

export const dynamic = "force-static";

export default async function CVListPage() {
  const [dbActors, saleFeature, dailyRecommendation, dbVoiceRanking] =
    await Promise.all([
      getActors(),
      getLatestSaleFeature(),
      getLatestDailyRecommendation(),
      getVoiceRankingWorks(1),
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

        <CVListContent actors={actors} />
      </main>

      <Footer />
    </div>
  );
}
