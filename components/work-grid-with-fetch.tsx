"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { WorkCard } from "@/components/work-card";
import type { Work } from "@/lib/types";
import { ChevronDown, Loader2 } from "lucide-react";

interface WorkGridWithFetchProps {
  /** 初期表示用の作品（SSGで埋め込み） */
  initialWorks: Work[];
  /** 総件数 */
  totalCount: number;
  /** fetch用のベースURL（例: "/data/tags/バイノーラル"） */
  fetchBasePath: string;
  /** 1ページあたりの件数（デフォルト20） */
  pageSize?: number;
}

// モバイル判定用
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function WorkGridWithFetch({
  initialWorks,
  totalCount,
  fetchBasePath,
  pageSize = 20,
}: WorkGridWithFetchProps) {
  const isMobile = useIsMobile();
  const [works, setWorks] = useState<Work[]>(initialWorks);
  const [currentPage, setCurrentPage] = useState(
    Math.ceil(initialWorks.length / pageSize)
  );
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  // 初期表示件数（モバイルは20件、PCは指定値）
  const targetDisplayCount = isMobile
    ? Math.min(20, works.length)
    : works.length;
  const [displayCount, setDisplayCount] = useState(20);
  const [prevTargetCount, setPrevTargetCount] = useState(targetDisplayCount);

  // モバイル/PC切り替え時（同期的に処理）
  if (targetDisplayCount !== prevTargetCount) {
    setPrevTargetCount(targetDisplayCount);
    setDisplayCount(targetDisplayCount);
  }

  const displayedWorks = works.slice(0, displayCount);
  const hasMore = displayCount < totalCount;
  const remainingCount = totalCount - displayCount;

  const handleLoadMore = useCallback(async () => {
    // まだ読み込んでないデータがある場合
    if (displayCount < works.length) {
      // ローカルのデータを表示
      startTransition(() => {
        const loadCount = isMobile ? 20 : pageSize;
        setDisplayCount((prev) => Math.min(prev + loadCount, works.length));
      });
      return;
    }

    // 次のページをfetch
    const nextPage = currentPage + 1;
    setIsFetching(true);

    try {
      const response = await fetch(`${fetchBasePath}/${nextPage}.json`);
      if (!response.ok) {
        console.error(`Failed to fetch page ${nextPage}`);
        setIsFetching(false);
        return;
      }

      const newWorks: Work[] = await response.json();

      startTransition(() => {
        setWorks((prev) => [...prev, ...newWorks]);
        setCurrentPage(nextPage);
        const loadCount = isMobile ? 20 : pageSize;
        setDisplayCount((prev) => Math.min(prev + loadCount, totalCount));
      });
    } catch (error) {
      console.error("Failed to load more works:", error);
    } finally {
      setIsFetching(false);
    }
  }, [
    displayCount,
    works.length,
    currentPage,
    fetchBasePath,
    isMobile,
    pageSize,
    totalCount,
  ]);

  const isLoading = isPending || isFetching;

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
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {isLoading ? "読み込み中..." : `もっと見る（残り${remainingCount}件）`}
          </Button>
        </div>
      )}
    </div>
  );
}
