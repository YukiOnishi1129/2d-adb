import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHeaderCard } from "@/components/page-header-card";
import { WorkCard } from "@/components/work-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getWorksByTag, getAllTagNames, getFeatureByName } from "@/lib/db";
import { Sparkles, ChevronRight } from "lucide-react";
import { dbWorkToWork } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  const [dbWorks, relatedFeature] = await Promise.all([
    getWorksByTag(decodedName),
    getFeatureByName(decodedName),
  ]);

  if (dbWorks.length === 0) {
    notFound();
  }

  const works = dbWorks.map(dbWorkToWork);

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
              <Card className="overflow-hidden border-2 border-amber-500/50 hover:border-amber-500 transition-all bg-linear-to-r from-amber-500/10 to-amber-500/5">
                <div className="flex items-center gap-4 p-4">
                  {relatedFeature.thumbnail_url && (
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={relatedFeature.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-bold text-foreground">
                        {relatedFeature.name}特集
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {relatedFeature.headline ||
                        `厳選${relatedFeature.name}作品をチェック`}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-amber-500 shrink-0" />
                </div>
              </Card>
            </Link>
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
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
