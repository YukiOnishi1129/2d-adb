import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHeaderCard } from "@/components/page-header-card";
import { WorkCard } from "@/components/work-card";
import { Badge } from "@/components/ui/badge";
import { getWorksByActor, getAllActorNames } from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  const dbWorks = await getWorksByActor(decodedName);

  if (dbWorks.length === 0) {
    notFound();
  }

  const works = dbWorks.map(dbWorkToWork);

  // この声優の作品に関連するタグを抽出
  const relatedTags = new Map<string, number>();
  works.forEach((work) => {
    work.aiTags.forEach((tag) => {
      relatedTags.set(tag, (relatedTags.get(tag) || 0) + 1);
    });
  });
  const sortedTags = Array.from(relatedTags.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

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

        {/* 関連タグ */}
        {sortedTags.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">
              {decodedName}の作品タグ
            </h2>
            <div className="flex flex-wrap gap-2">
              {sortedTags.map(([tag, count]) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                >
                  <Badge
                    variant="tag"
                    className="cursor-pointer text-sm hover:opacity-80"
                  >
                    {tag}
                    <span className="ml-1 opacity-70">({count})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 出演作品一覧 */}
        <h2 className="mb-4 text-xl font-bold text-foreground">出演作品</h2>

        {works.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
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
