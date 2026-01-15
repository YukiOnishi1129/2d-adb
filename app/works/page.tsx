import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WorkCard } from "@/components/work-card";
import { Badge } from "@/components/ui/badge";
import { SearchForm } from "@/components/search-form";
import { FeaturedBanners } from "@/components/featured-banners";
import {
  getAllWorks,
  getSaleWorks,
  getActors,
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
  getWorksByIds,
  getVoiceRankingWorks,
} from "@/lib/db";
import { dbWorkToWork, dbActorToActor } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-static";

export default async function WorksPage() {
  const [dbAllWorks, dbSaleWorks, dbActors, saleFeature, dailyRecommendation, dbVoiceRanking] = await Promise.all([
    getAllWorks(),
    getSaleWorks(100),
    getActors(),
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
    getVoiceRankingWorks(1),
  ]);

  const allWorks = dbAllWorks.map(dbWorkToWork);
  const saleCount = dbSaleWorks.length;
  const actors = dbActors.slice(0, 4).map(dbActorToActor);

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

  const voiceWorks = allWorks.filter(
    (w) => w.genre?.includes("ボイス") || w.genre?.includes("ASMR"),
  );
  const gameWorks = allWorks.filter((w) => w.genre?.includes("ゲーム"));

  return (
    <div className="min-h-screen bg-background">
      <Header />

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

        {/* タイトル + 導入文 */}
        <div className="mb-4">
          <h1 className="mb-2 text-2xl font-bold text-foreground">作品一覧</h1>
          <p className="text-sm text-muted-foreground">
            公式にはない「詳細スペック」で探す、二次元特化型データベース
          </p>
        </div>

        {/* 検索フォーム */}
        <div className="mb-4">
          <SearchForm placeholder="タイトル、声優、サークル、タグで検索..." />
        </div>

        {/* ジャンルフィルター */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Link
            href="/works"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            すべて
          </Link>
          <Link
            href="/search?genre=voice"
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-primary hover:bg-secondary"
          >
            音声・ASMR
          </Link>
          <Link
            href="/search?genre=game"
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-primary hover:bg-secondary"
          >
            ゲーム
          </Link>
        </div>

        {/* クイックアクセス: セール・人気声優 */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Link href="/sale">
            <Badge
              variant="sale"
              className="cursor-pointer text-xs hover:opacity-80"
            >
              セール中 ({saleCount})
            </Badge>
          </Link>
          {actors.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground">人気声優:</span>
              {actors.map((actor) => (
                <Link
                  key={actor.name}
                  href={`/cv/${encodeURIComponent(actor.name)}`}
                >
                  <Badge
                    variant="cv"
                    className="cursor-pointer text-xs hover:opacity-80"
                  >
                    {actor.name}
                  </Badge>
                </Link>
              ))}
            </>
          )}
        </div>

        {/* 音声・ASMR */}
        {voiceWorks.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">
              音声・ASMR ({voiceWorks.length})
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {voiceWorks.slice(0, 20).map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          </section>
        )}

        {/* ゲーム */}
        {gameWorks.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">
              ゲーム ({gameWorks.length})
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {gameWorks.slice(0, 20).map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
