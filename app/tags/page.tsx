import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHeaderCard } from "@/components/page-header-card";
import { Badge } from "@/components/ui/badge";
import { getTags } from "@/lib/db";
import { dbTagToTag } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-static";

export default async function TagsListPage() {
  const dbTags = await getTags();
  const tags = dbTags.map(dbTagToTag);

  // 作品数でカテゴリ分け
  const popularTags = tags.filter((t) => t.workCount >= 10);
  const regularTags = tags.filter((t) => t.workCount >= 3 && t.workCount < 10);
  const otherTags = tags.filter((t) => t.workCount < 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb
          items={[{ label: "トップ", href: "/" }, { label: "タグ一覧" }]}
        />

        <PageHeaderCard
          title="タグ一覧"
          subtitle={`${tags.length}タグ`}
        />

        {/* 人気タグ（10作品以上） */}
        {popularTags.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              人気タグ
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`}>
                  <Badge
                    variant="tag"
                    className="cursor-pointer text-sm hover:opacity-80 py-1.5 px-3"
                  >
                    {tag.name}
                    <span className="ml-1 opacity-70">({tag.workCount})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 通常タグ（3-9作品） */}
        {regularTags.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              その他のタグ
            </h2>
            <div className="flex flex-wrap gap-2">
              {regularTags.map((tag) => (
                <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer text-sm hover:opacity-80"
                  >
                    {tag.name}
                    <span className="ml-1 opacity-70">({tag.workCount})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* その他（2作品以下） */}
        {otherTags.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-muted-foreground">
              マイナータグ
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherTags.map((tag) => (
                <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer text-xs hover:opacity-80 text-muted-foreground"
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
