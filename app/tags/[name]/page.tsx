import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHeaderCard } from "@/components/page-header-card";
import { WorkGridWithLoadMore } from "@/components/work-grid-with-load-more";
import { WorkGridWithFetch } from "@/components/work-grid-with-fetch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getWorksByTag, getAllTagNames, getFeatureByName, getRelatedTags } from "@/lib/db";
import { Sparkles, ChevronRight } from "lucide-react";
import { dbWorkToWork } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

// SSGで埋め込むデータの上限（これ以上はJSONが重くなりフリーズの原因になる）
const MAX_SSG_WORKS = 100;

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const dbWorks = await getWorksByTag(decodedName);

  if (dbWorks.length === 0) {
    return {
      title: "タグが見つかりません | 2D-ADB",
    };
  }

  const title = `「${decodedName}」タグの作品一覧（${dbWorks.length}作品） | 2D-ADB`;
  const description = `「${decodedName}」タグが付いたASMR・同人音声・同人ゲーム${dbWorks.length}作品を掲載。関連作品を簡単に探せます！`;

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
    const names = await getAllTagNames();
    console.log(`[Tag Page] generateStaticParams: ${names.length} tags found`);
    if (names.length === 0) {
      // データがない場合でもビルドを通すためのダミー
      return [{ name: "__placeholder__" }];
    }
    // Next.js 15+ではエンコード不要（フレームワークが自動処理）
    return names.map((name) => ({ name }));
  } catch (error) {
    console.error("[Tag Page] Error in generateStaticParams:", error);
    return [{ name: "__placeholder__" }];
  }
}

export const dynamic = "force-static";
export const dynamicParams = false; // 静的エクスポートでは必須

export default async function TagDetailPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const [dbWorks, relatedFeature, relatedTags] = await Promise.all([
    getWorksByTag(decodedName),
    getFeatureByName(decodedName),
    getRelatedTags(decodedName, 10),
  ]);

  if (dbWorks.length === 0) {
    notFound();
  }

  // SSGで渡すデータ量を制限（100件まで）
  // 101件目以降は検索ページで対応
  const totalCount = dbWorks.length;
  const limitedDbWorks = dbWorks.slice(0, MAX_SSG_WORKS);
  const works = limitedDbWorks.map(dbWorkToWork);

  // このタグの作品に出演している声優を抽出
  const relatedCVs = new Map<string, number>();
  works.forEach((work) => {
    work.actors.forEach((actor) => {
      relatedCVs.set(actor, (relatedCVs.get(actor) || 0) + 1);
    });
  });
  const sortedCVs = Array.from(relatedCVs.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "タグ", href: "/tags" },
            { label: decodedName },
          ]}
        />

        <PageHeaderCard
          title={`#${decodedName}`}
          subtitle={`${works.length}作品`}
        />

        {/* 関連特集バナー */}
        {relatedFeature && (
          <div className="mb-8">
            <Link href={`/feature/${relatedFeature.slug}`}>
              <Card className="overflow-hidden border border-amber-500/30 hover:border-amber-500/50 transition-all">
                {relatedFeature.thumbnail_url ? (
                  <div className="relative aspect-[21/9] overflow-hidden">
                    <img
                      src={relatedFeature.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {/* 上下グラデーション */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent" />
                    {/* ラベル */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-sm font-bold text-white bg-amber-500" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                      ✨ {relatedFeature.name}特集
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold text-white mb-1" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                            {relatedFeature.headline || `厳選${relatedFeature.name}作品をチェック`}
                          </p>
                          <p className="text-sm text-white/80" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                            {relatedFeature.name}の人気作品を特集
                          </p>
                        </div>
                        <ChevronRight className="h-6 w-6 text-white shrink-0" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-linear-to-r from-amber-500/10 to-amber-500/5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 shrink-0">
                      <Sparkles className="h-7 w-7 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-foreground">
                          ✨ {relatedFeature.name}特集
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {relatedFeature.headline || `厳選${relatedFeature.name}作品をチェック`}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-amber-500 shrink-0" />
                  </div>
                )}
              </Card>
            </Link>
          </div>
        )}

        {/* 関連タグ */}
        {relatedTags.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">
              関連タグ
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map(({ name: tagName, count }) => (
                <Link
                  key={tagName}
                  href={`/tags/${encodeURIComponent(tagName)}`}
                >
                  <Badge
                    variant="tag"
                    className="cursor-pointer text-sm hover:opacity-80"
                  >
                    {tagName}
                    <span className="ml-1 opacity-70">({count})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 関連声優 */}
        {sortedCVs.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">
              「{decodedName}」の人気声優
            </h2>
            <div className="flex flex-wrap gap-2">
              {sortedCVs.map(([cv, count]) => (
                <Link
                  key={cv}
                  href={`/cv/${encodeURIComponent(cv)}`}
                >
                  <Badge
                    variant="cv"
                    className="cursor-pointer text-sm hover:opacity-80"
                  >
                    {cv}
                    <span className="ml-1 opacity-70">({count})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 作品一覧 */}
        <h2 className="mb-4 text-xl font-bold text-foreground">作品一覧</h2>

        {works.length > 0 ? (
          totalCount > MAX_SSG_WORKS ? (
            // 100件超えの場合はfetchで追加データを取得
            <WorkGridWithFetch
              initialWorks={works}
              totalCount={totalCount}
              fetchBasePath={`/data/tags/${encodeURIComponent(decodedName)}`}
            />
          ) : (
            // 100件以下はSSGデータのみ
            <WorkGridWithLoadMore works={works} />
          )
        ) : (
          <p className="text-muted-foreground">
            このタグの作品はまだ登録されていません。
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
