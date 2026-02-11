import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHeaderCard } from "@/components/page-header-card";
import { WorkGridWithLoadMore } from "@/components/work-grid-with-load-more";
import { WorkGridWithFetch } from "@/components/work-grid-with-fetch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getWorksByActor, getAllActorNames, getVoiceActorFeatureByName } from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mic, ChevronRight, Star, Sparkles } from "lucide-react";

// SSGで埋め込むデータの上限（これ以上はJSONが重くなりフリーズの原因になる）
const MAX_SSG_WORKS = 100;

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const dbWorks = await getWorksByActor(decodedName);

  if (dbWorks.length === 0) {
    return {
      title: "声優が見つかりません | 2D-ADB",
    };
  }

  const title = `${decodedName}の出演作品一覧（${dbWorks.length}作品） | 2D-ADB`;
  const description = `${decodedName}が出演するASMR・同人音声・同人ゲーム${dbWorks.length}作品を掲載。人気作品やセール情報もチェック！`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export async function generateStaticParams(): Promise<{ name: string }[]> {
  try {
    const names = await getAllActorNames();
    console.log(`[CV Page] generateStaticParams: ${names.length} actors found`);
    if (names.length === 0) {
      // データがない場合でもビルドを通すためのダミー（ページ側で404を返す）
      return [{ name: "__placeholder__" }];
    }
    // Next.js 15+ではエンコード不要（フレームワークが自動処理）
    return names.map((name) => ({ name }));
  } catch (error) {
    console.error("[CV Page] Error in generateStaticParams:", error);
    return [{ name: "__placeholder__" }];
  }
}

export const dynamic = "force-static";
export const dynamicParams = false; // 生成されていないパスは404

export default async function CVDetailPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const [dbWorks, voiceActorFeature] = await Promise.all([
    getWorksByActor(decodedName),
    getVoiceActorFeatureByName(decodedName),
  ]);

  if (dbWorks.length === 0) {
    notFound();
  }

  // SSGで渡すデータ量を制限（100件まで）
  const totalCount = dbWorks.length;
  const limitedDbWorks = dbWorks.slice(0, MAX_SSG_WORKS);
  const works = limitedDbWorks.map(dbWorkToWork);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "声優", href: "/cv" },
            { label: decodedName },
          ]}
        />

        <PageHeaderCard
          title={decodedName}
          subtitle={`${works.length}作品に出演`}
        />

        {/* 声優特集への導線（特集がある場合のみ表示） */}
        {voiceActorFeature && (
          <Link href={`/tokushu/cv/${encodeURIComponent(decodedName)}`}>
            <Card className="mb-6 overflow-hidden border border-pink-500/30 hover:border-pink-500/50 transition-all">
              {voiceActorFeature.representative_thumbnail_url ? (
                <div className="relative aspect-[21/9] overflow-hidden">
                  <img
                    src={voiceActorFeature.representative_thumbnail_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* 上下グラデーション */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent" />
                  {/* ラベル */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-sm font-bold text-white bg-pink-500" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                    🎤 {decodedName}特集
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-white mb-1" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                          {voiceActorFeature.headline || `${decodedName}のおすすめASMR`}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-white/80" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                          {voiceActorFeature.avg_rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }} />
                              平均{voiceActorFeature.avg_rating.toFixed(1)}
                            </span>
                          )}
                          {voiceActorFeature.sale_count > 0 && (
                            <span className="flex items-center gap-1 text-sale">
                              <Sparkles className="h-3.5 w-3.5" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }} />
                              {voiceActorFeature.sale_count}作品セール中
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-white shrink-0" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/20 shrink-0">
                    <Mic className="h-7 w-7 text-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-pink-500 text-white text-xs px-2 py-0.5">
                        🎤 声優特集
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      {voiceActorFeature.headline || `${decodedName}のおすすめASMR`}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-pink-500 shrink-0" />
                </div>
              )}
            </Card>
          </Link>
        )}

        {/* 出演作品一覧 */}
        <h2 className="mb-4 text-xl font-bold text-foreground">出演作品</h2>

        {works.length > 0 ? (
          totalCount > MAX_SSG_WORKS ? (
            // 100件超えの場合はfetchで追加データを取得
            <WorkGridWithFetch
              initialWorks={works}
              totalCount={totalCount}
              fetchBasePath={`/data/cv/${encodeURIComponent(decodedName)}`}
            />
          ) : (
            // 100件以下はSSGデータのみ
            <WorkGridWithLoadMore works={works} />
          )
        ) : (
          <p className="text-muted-foreground">
            この声優の出演作品はまだ登録されていません。
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
