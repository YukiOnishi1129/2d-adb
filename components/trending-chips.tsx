import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Actor, Tag } from "@/lib/types";

interface TrendingChipsProps {
  actors: Actor[];
  tags: Tag[];
}

export function TrendingChips({ actors, tags }: TrendingChipsProps) {
  return (
    <section className="mb-4 space-y-2">
      {/* 人気声優 */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 overscroll-x-contain">
        <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
          人気声優
        </span>
        <div className="flex gap-1.5">
          {actors.slice(0, 6).map((actor) => (
            <Link
              key={actor.name}
              href={`/cv/${encodeURIComponent(actor.name)}`}
            >
              <Badge
                variant="cv"
                className="cursor-pointer text-[10px] px-2 py-0.5 transition-opacity hover:opacity-80 whitespace-nowrap"
              >
                {actor.name}
              </Badge>
            </Link>
          ))}
          <Link href="/cv">
            <Badge
              variant="outline"
              className="cursor-pointer text-[10px] px-2 py-0.5 transition-opacity hover:opacity-80 whitespace-nowrap"
            >
              もっと見る
            </Badge>
          </Link>
        </div>
      </div>

      {/* 人気タグ */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 overscroll-x-contain">
        <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
          人気タグ
        </span>
        <div className="flex gap-1.5">
          {tags.slice(0, 6).map((tag) => (
            <Link key={tag.name} href={`/tags/${encodeURIComponent(tag.name)}`}>
              <Badge
                variant="tag"
                className="cursor-pointer text-[10px] px-2 py-0.5 transition-opacity hover:opacity-80 whitespace-nowrap"
              >
                {tag.name}
              </Badge>
            </Link>
          ))}
          <Link href="/tags">
            <Badge
              variant="outline"
              className="cursor-pointer text-[10px] px-2 py-0.5 transition-opacity hover:opacity-80 whitespace-nowrap"
            >
              もっと見る
            </Badge>
          </Link>
        </div>
      </div>
    </section>
  );
}
