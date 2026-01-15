import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getLatestDailyRecommendation,
  getWorksByIds,
  getDlsiteRankingWorks,
  getLatestSaleFeature,
  getWorkById,
} from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import type { Work } from "@/lib/types";
import {
  Star,
  Clock,
  Headphones,
  Gamepad2,
  Play,
  ExternalLink,
  Trophy,
  ThumbsUp,
  Users,
  Flame,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

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

// おすすめカード（大きめ）
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
            <a
              href={sampleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                <Play className="h-3 w-3 mr-1" />
                {isASMR ? "試聴する" : "体験版"}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </a>
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
          TOP {works.length}
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

export default async function RecommendationsPage() {
  // おすすめデータを取得
  const recommendation = await getLatestDailyRecommendation();

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-muted-foreground">おすすめデータがありません</p>
        </main>
        <Footer />
      </div>
    );
  }

  // 作品データを取得
  const asmrWorkIds = (recommendation.asmr_works || []).map(w => w.work_id);
  const gameWorkIds = (recommendation.game_works || []).map(w => w.work_id);

  const [asmrDbWorks, gameDbWorks, rankingDbWorks, saleFeature] = await Promise.all([
    getWorksByIds(asmrWorkIds),
    getWorksByIds(gameWorkIds),
    getDlsiteRankingWorks(1), // CTA用に1件だけ取得
    getLatestSaleFeature(),
  ]);

  // セール特集のメイン作品を取得
  const saleFeatureMainWork = saleFeature?.main_work_id
    ? await getWorkById(saleFeature.main_work_id)
    : null;

  const asmrWorks = asmrDbWorks.map(dbWorkToWork);
  const gameWorks = gameDbWorks.map(dbWorkToWork);
  const saleThumbnail = saleFeatureMainWork?.thumbnail_url || null;
  const saleTargetDate = saleFeature?.target_date;
  const mainWorkSaleEndDate = saleFeatureMainWork?.sale_end_date_dlsite || saleFeatureMainWork?.sale_end_date_fanza;
  const saleMaxDiscountRate = saleFeature?.max_discount_rate;
  const rankingThumbnail = rankingDbWorks[0]?.thumbnail_url;

  // セール特集のタイトル・サブテキスト生成
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  const saleTitle = saleTargetDate
    ? `${formatShortDate(saleTargetDate)}のセール特集`
    : "今日のセール特集";
  let saleSubtext = "厳選おすすめ作品";
  if (saleMaxDiscountRate && mainWorkSaleEndDate) {
    saleSubtext = `${formatShortDate(mainWorkSaleEndDate)}まで最大${saleMaxDiscountRate}%OFF！`;
  } else if (saleMaxDiscountRate) {
    saleSubtext = `最大${saleMaxDiscountRate}%OFF！`;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {/* ページヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-bold text-foreground">
              {recommendation.headline || "今日のおすすめ"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            当サイトの編集部が厳選した作品をご紹介
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            {recommendation.target_date} 更新
          </div>
        </div>

        {/* ASMR部門 */}
        <CategorySection
          title="ASMR部門TOP5"
          icon={Headphones}
          works={asmrWorks}
          recommendations={recommendation.asmr_works || []}
          isASMR={true}
        />

        {/* ゲーム部門 */}
        <CategorySection
          title="ゲーム部門TOP5"
          icon={Gamepad2}
          works={gameWorks}
          recommendations={recommendation.game_works || []}
          isASMR={false}
        />

        {/* 他のコンテンツへの誘導 */}
        <section className="mt-10 space-y-6">
          {/* セール特集への誘導 */}
          <Link href="/sale/tokushu">
            <Card className="overflow-hidden border border-sale/30 hover:border-sale/50 transition-all">
              <div className="flex items-center gap-4 p-4">
                {/* サムネイル（セール作品から取得） */}
                {saleThumbnail && (
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={saleThumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-sale/20 to-transparent" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="h-4 w-4 text-sale" />
                    <span className="text-sm font-bold text-sale">{saleTitle}</span>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">
                    {saleSubtext}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-sale shrink-0" />
              </div>
            </Card>
          </Link>

          {/* ランキングへの誘導 */}
          <Link href="/">
            <Card className="overflow-hidden border border-primary/30 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-4 p-4">
                {/* サムネイル（ランキング上位作品から取得） */}
                {rankingThumbnail && (
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={rankingThumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-transparent" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-primary">人気ランキング</span>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">
                    DLsite・FANZAの注目作品！
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-primary shrink-0" />
              </div>
            </Card>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
