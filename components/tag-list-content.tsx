"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { Tag } from "@/lib/types";

interface TagListContentProps {
  popularTags: Tag[];
  regularTags: Tag[];
  otherTags: Tag[];
}

export function TagListContent({
  popularTags,
  regularTags,
  otherTags,
}: TagListContentProps) {
  const [showAllOther, setShowAllOther] = useState(false);
  const initialOtherCount = 100;
  const displayedOtherTags = showAllOther
    ? otherTags
    : otherTags.slice(0, initialOtherCount);

  return (
    <>
      {/* 人気タグ（10作品以上） */}
      {popularTags.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">人気タグ</h2>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Link
                key={tag.name}
                href={`/tags/${encodeURIComponent(tag.name)}`}
              >
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
              <Link
                key={tag.name}
                href={`/tags/${encodeURIComponent(tag.name)}`}
              >
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
            {displayedOtherTags.map((tag) => (
              <Link
                key={tag.name}
                href={`/tags/${encodeURIComponent(tag.name)}`}
              >
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
          {!showAllOther && otherTags.length > initialOtherCount && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAllOther(true)}
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                もっと見る（残り{otherTags.length - initialOtherCount}件）
              </Button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
