import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { getTags } from "@/lib/db";
import { dbTagToTag } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-static";

export default async function TagsListPage() {
  const dbTags = await getTags();
  const tags = dbTags.map(dbTagToTag);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb
          items={[{ label: "トップ", href: "/" }, { label: "タグ一覧" }]}
        />

        <h1 className="mb-6 text-2xl font-bold text-foreground">タグ一覧</h1>

        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`}>
              <Badge
                variant="tag"
                className="cursor-pointer text-sm hover:opacity-80"
              >
                {tag.name}
                <span className="ml-1 opacity-70">({tag.workCount})</span>
              </Badge>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
