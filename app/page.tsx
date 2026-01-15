import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSaleBanner } from "@/components/hero-sale-banner";
import { HorizontalScrollSection } from "@/components/horizontal-scroll-section";
import { TrendingChips } from "@/components/trending-chips";
import { FeaturedBanners } from "@/components/featured-banners";
import { Badge } from "@/components/ui/badge";
import {
  getNewWorks,
  getSaleWorks,
  getBargainWorks,
  getActors,
  getTags,
  getDlsiteRankingWorks,
  getFanzaRankingWorks,
  getVoiceRankingWorks,
  getGameRankingWorks,
  getHighRatedWorks,
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
  getWorksByIds,
} from "@/lib/db";
import { dbWorkToWork, dbActorToActor, dbTagToTag } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-static";

export default async function Home() {
  // DBからデータ取得
  const [
    dbSaleWorks,
    dbNewWorks,
    dbVoiceRanking,
    dbGameRanking,
    dbHighRated,
    dbBargainWorks,
    dbDlsiteRanking,
    dbFanzaRanking,
    dbActors,
    dbTags,
    saleFeature,
    dailyRecommendation,
  ] = await Promise.all([
    getSaleWorks(12),
    getNewWorks(12),
    getVoiceRankingWorks(12),
    getGameRankingWorks(12),
    getHighRatedWorks(4.5, 12),
    getBargainWorks(500, 12),
    getDlsiteRankingWorks(12),
    getFanzaRankingWorks(12),
    getActors(),
    getTags(),
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
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

  // 型変換
  const saleWorks = dbSaleWorks.map(dbWorkToWork);
  const newWorks = dbNewWorks.map(dbWorkToWork);
  const voiceRanking = dbVoiceRanking.map(dbWorkToWork);
  const gameRanking = dbGameRanking.map(dbWorkToWork);
  const highRatedWorks = dbHighRated.map(dbWorkToWork);
  const bargainWorks = dbBargainWorks.map(dbWorkToWork);
  const dlsiteRanking = dbDlsiteRanking.map(dbWorkToWork);
  const fanzaRanking = dbFanzaRanking.map(dbWorkToWork);
  const actors = dbActors.slice(0, 12).map(dbActorToActor);
  const tags = dbTags.slice(0, 12).map(dbTagToTag);

  // バナー用サムネイル・セール特集日
  const saleThumbnail = saleFeatureMainWork?.thumbnail_url || dbSaleWorks[0]?.thumbnail_url;
  const saleTargetDate = saleFeature?.target_date;
  const mainWorkSaleEndDate = saleFeatureMainWork?.sale_end_date_dlsite || saleFeatureMainWork?.sale_end_date_fanza;
  const recommendationThumbnail = recommendationWorks[0]?.thumbnail_url || dbVoiceRanking[0]?.thumbnail_url;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-4">
        {/* セールバナー（コンパクト） */}
        {saleWorks.length > 0 && <HeroSaleBanner saleWorks={saleWorks} />}

        {/* 今日のセール特集 & 今日のおすすめ */}
        <FeaturedBanners
          saleThumbnail={saleThumbnail}
          saleMaxDiscountRate={saleFeature?.max_discount_rate}
          saleTargetDate={saleTargetDate}
          mainWorkSaleEndDate={mainWorkSaleEndDate}
          recommendationThumbnail={recommendationThumbnail}
          recommendationDate={dailyRecommendation?.target_date}
        />

        {/* トレンドチップ（コンパクト） */}
        <TrendingChips actors={actors} tags={tags} />

        {/* ボイス・ASMRランキング（横スクロール＋金銀銅バッジ） */}
        {voiceRanking.length > 0 && (
          <HorizontalScrollSection
            title="ボイス・ASMRランキング"
            href="/search?genre=voice&sort=rank"
            works={voiceRanking}
            showRankBadge
            rankBadgeColor="emerald"
          />
        )}

        {/* ゲームランキング（横スクロール＋金銀銅バッジ） */}
        {gameRanking.length > 0 && (
          <HorizontalScrollSection
            title="ゲームランキング"
            href="/search?genre=game&sort=rank"
            works={gameRanking}
            showRankBadge
            rankBadgeColor="emerald"
          />
        )}

        {/* 高評価4.5以上（横スクロール） */}
        {highRatedWorks.length > 0 && (
          <HorizontalScrollSection
            title="高評価（4.5以上）"
            href="/search?sort=rating"
            works={highRatedWorks}
          />
        )}

        {/* DLsite人気ランキング（横スクロール＋金銀銅バッジ） */}
        {dlsiteRanking.length > 0 && (
          <HorizontalScrollSection
            title="DLsite人気ランキング"
            href="/search?platform=dlsite&sort=rank"
            works={dlsiteRanking}
            showRankBadge
            rankBadgeColor="purple"
          />
        )}

        {/* FANZAランキング（横スクロール＋金銀銅バッジ） */}
        {fanzaRanking.length > 0 && (
          <HorizontalScrollSection
            title="FANZAランキング"
            href="/search?platform=fanza&sort=rank"
            works={fanzaRanking}
            showRankBadge
            rankBadgeColor="orange"
          />
        )}

        {/* 爆安コーナー（横スクロール） */}
        {bargainWorks.length > 0 && (
          <HorizontalScrollSection
            title="爆安コーナー（500円以下）"
            href="/sale?max=500"
            works={bargainWorks}
          />
        )}

        {/* セール中（横スクロール） */}
        {saleWorks.length > 0 && (
          <HorizontalScrollSection
            title="セール中（割引率順）"
            href="/sale"
            works={saleWorks}
          />
        )}

        {/* 新着作品（横スクロール） */}
        <HorizontalScrollSection
          title="新着作品"
          href="/search?sort=new"
          works={newWorks}
        />

        {/* 人気声優 */}
        {actors.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">人気声優</h2>
              <Link
                href="/cv"
                className="flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent/80"
              >
                もっと見る
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {actors.slice(0, 8).map((actor) => (
                <Link
                  key={actor.name}
                  href={`/cv/${encodeURIComponent(actor.name)}`}
                >
                  <Badge
                    variant="cv"
                    className="cursor-pointer hover:opacity-80 text-sm py-1.5 px-3"
                  >
                    {actor.name}
                    <span className="ml-1 opacity-70">({actor.workCount})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 人気タグ */}
        {tags.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">人気タグ</h2>
              <Link
                href="/tags"
                className="flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent/80"
              >
                もっと見る
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 12).map((tag) => (
                <Link
                  key={tag.name}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                >
                  <Badge
                    variant="tag"
                    className="cursor-pointer hover:opacity-80 text-sm py-1.5 px-3"
                  >
                    {tag.name}
                    <span className="ml-1 opacity-70">({tag.workCount})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
