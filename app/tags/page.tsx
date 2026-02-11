import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHeaderCard } from "@/components/page-header-card";
import { TagListContent } from "@/components/tag-list-content";
import { getTags } from "@/lib/db";
import { dbTagToTag } from "@/lib/types";

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

        <PageHeaderCard title="タグ一覧" subtitle={`${tags.length}タグ`} />

        <TagListContent
          popularTags={popularTags}
          regularTags={regularTags}
          otherTags={otherTags}
        />
      </main>

      <Footer />
    </div>
  );
}
