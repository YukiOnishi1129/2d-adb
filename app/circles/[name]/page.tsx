import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { LastUpdated } from "@/components/last-updated";
import { EditorialCredit } from "@/components/editorial-credit";
import { CircleOrganizationJsonLd } from "@/components/json-ld";
import { PageHeaderCard } from "@/components/page-header-card";
import { WorkGridWithLoadMore } from "@/components/work-grid-with-load-more";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCircleWithWorks, getAllCircleNames } from "@/lib/db";
import { dbCircleToCircle, dbWorkToWork } from "@/lib/types";
import { notFound } from "next/navigation";

// SSGで埋め込むデータの上限（これ以上はJSONが重くなりフリーズの原因になる）
const MAX_SSG_WORKS = 100;

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const { circle: dbCircle, works: dbWorks } = await getCircleWithWorks(decodedName);

  if (!dbCircle) {
    return {
      title: "サークルが見つかりません | 2D-ADB",
    };
  }

  const genreText = dbCircle.main_genre ? `【${dbCircle.main_genre}】` : "";
  const saleCount = dbWorks.filter(
    (w) => (w.discount_rate_dlsite ?? 0) > 0 || (w.discount_rate_fanza ?? 0) > 0,
  ).length;
  const year = new Date().getFullYear();
  const saleBadge = saleCount > 0 ? `【${saleCount}作品セール中】` : "";

  // クリック誘導タイトル: 【YYYY年】サークル{name}のおすすめASMR N選｜代表作・新作レビュー
  const title = `${saleBadge}【${year}年】${genreText}サークル「${decodedName}」のおすすめ作品${dbWorks.length}選｜代表作・新作レビュー | 2D-ADB`;
  const description = `同人サークル「${decodedName}」${dbCircle.main_genre ? `（${dbCircle.main_genre}）` : ""}のASMR・同人音声・同人ゲーム${dbWorks.length}作品を2D-ADB編集部がレビュー。代表作・新作・人気作・セール作品をまとめてチェック。${saleCount > 0 ? `現在${saleCount}作品がセール中。` : ""}`;

  return {
    title,
    description,
    alternates: { canonical: `/circles/${name}/` },
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

export async function generateStaticParams() {
  const names = await getAllCircleNames();
  return names.map((name) => ({
    name: name,
  }));
}

export const dynamic = "force-static";
export const dynamicParams = false; // 静的エクスポートでは必須

export default async function CircleDetailPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const { circle: dbCircle, works: dbWorks } =
    await getCircleWithWorks(decodedName);

  if (!dbCircle) {
    notFound();
  }

  const circle = dbCircleToCircle(dbCircle);

  // SSGで渡すデータ量を制限（100件まで）
  const totalCount = dbWorks.length;
  const limitedDbWorks = dbWorks.slice(0, MAX_SSG_WORKS);
  const works = limitedDbWorks.map(dbWorkToWork);

  const pageUrl = `https://2d-adb.com/circles/${name}/`;

  return (
    <div className="min-h-screen bg-background">
      <CircleOrganizationJsonLd
        name={circle.name}
        workCount={totalCount}
        mainGenre={circle.mainGenre}
        pageUrl={pageUrl}
      />
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Breadcrumb
            items={[
              { label: "トップ", href: "/" },
              { label: "サークル", href: "/circles" },
              { label: circle.name },
            ]}
          />
          <LastUpdated variant="card" />
        </div>

        <PageHeaderCard title={circle.name}>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {circle.mainGenre && (
              <Badge variant="secondary">{circle.mainGenre}</Badge>
            )}
            <span className="text-muted-foreground">
              {circle.workCount}作品
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            {circle.dlsiteId && (
              <a
                href={`https://www.dlsite.com/maniax/circle/profile/=/maker_id/${circle.dlsiteId}.html`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  DLsite →
                </Button>
              </a>
            )}
            {circle.fanzaId && (
              <a
                href={`https://www.dmm.co.jp/dc/doujin/-/maker/=/article=maker/id=${circle.fanzaId}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  FANZA →
                </Button>
              </a>
            )}
          </div>
        </PageHeaderCard>

        {/* 作品一覧 */}
        <h2 className="mb-4 text-xl font-bold text-foreground">作品一覧</h2>

        {works.length > 0 ? (
          <>
            <WorkGridWithLoadMore works={works} />
            {totalCount > MAX_SSG_WORKS && (
              <div className="mt-6 text-center">
                <a
                  href={`/search/?q=${encodeURIComponent(decodedName)}`}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  検索ページで全{totalCount}件を見る →
                </a>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">
            このサークルの作品はまだ登録されていません。
          </p>
        )}

        <EditorialCredit />
      </main>

      <Footer />
    </div>
  );
}
