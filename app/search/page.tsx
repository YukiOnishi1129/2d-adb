import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchContent } from "@/components/search-content";
import {
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
  getWorksByIds,
  getVoiceRankingWorks,
  getSaleWorks,
} from "@/lib/db";

export const dynamic = "force-static";

export default async function SearchPage() {
  // バナー用データ取得
  const [saleFeature, dailyRecommendation, dbVoiceRanking, dbSaleWorks] = await Promise.all([
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
    getVoiceRankingWorks(1),
    getSaleWorks(1),
  ]);

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

  const bannerData = {
    saleThumbnail,
    saleMaxDiscountRate: saleFeature?.max_discount_rate,
    saleTargetDate,
    mainWorkSaleEndDate,
    recommendationThumbnail,
    recommendationDate: dailyRecommendation?.target_date,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-4">
        <SearchContent bannerData={bannerData} />
      </main>

      <Footer />
    </div>
  );
}
