import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SaleFilterSort } from "@/components/sale-filter-sort";
import { FeaturedBanners } from "@/components/featured-banners";
import {
  getSaleWorks,
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
  getWorksByIds,
  getVoiceRankingWorks,
} from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import { Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "セール中の作品一覧 | 2D-ADB",
  description: "今お得に買えるASMR・同人音声・同人ゲームをまとめてチェック。割引率・価格順で並び替え可能。",
  openGraph: {
    title: "セール中の作品一覧 | 2D-ADB",
    description: "今お得に買えるASMR・同人音声・同人ゲームをまとめてチェック。",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "セール中の作品一覧 | 2D-ADB",
    description: "今お得に買えるASMR・同人音声・同人ゲームをまとめてチェック。",
  },
};

export const dynamic = "force-static";

export default async function SalePage() {
  // セール中の全作品を取得（上限を大きく）+ バナー用データ
  const [dbSaleWorks, saleFeature, dailyRecommendation, dbVoiceRanking] = await Promise.all([
    getSaleWorks(200),
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
    getVoiceRankingWorks(1),
  ]);
  const saleWorks = dbSaleWorks.map(dbWorkToWork);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-4">
        {/* コンパクトヘッダー */}
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-sale" />
          <h1 className="text-xl font-bold text-foreground">セール中の作品</h1>
          <span className="text-sm text-muted-foreground">
            （{saleWorks.length}件）
          </span>
        </div>

        {/* 今日のセール特集 & 今日のおすすめバナー */}
        <FeaturedBanners
          saleThumbnail={saleThumbnail}
          saleMaxDiscountRate={saleFeature?.max_discount_rate}
          saleTargetDate={saleTargetDate}
          mainWorkSaleEndDate={mainWorkSaleEndDate}
          recommendationThumbnail={recommendationThumbnail}
          recommendationDate={dailyRecommendation?.target_date}
        />

        {/* フィルター・ソート付き作品一覧 */}
        <SaleFilterSort works={saleWorks} />
      </main>

      <Footer />
    </div>
  );
}
