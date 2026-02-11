"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WorkCard } from "@/components/work-card";
import type { Work } from "@/lib/types";
import { ChevronDown } from "lucide-react";

interface WorkGridWithLoadMoreProps {
  works: Work[];
  initialCount?: number;
  loadMoreCount?: number;
}

export function WorkGridWithLoadMore({
  works,
  initialCount = 50,
  loadMoreCount = 50,
}: WorkGridWithLoadMoreProps) {
  const [displayCount, setDisplayCount] = useState(initialCount);

  const displayedWorks = works.slice(0, displayCount);
  const hasMore = displayCount < works.length;
  const remainingCount = works.length - displayCount;

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + loadMoreCount, works.length));
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {displayedWorks.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            もっと見る（残り{remainingCount}件）
          </Button>
        </div>
      )}
    </div>
  );
}
