import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";

export function RecommendationsBanner() {
  return (
    <Link href="/recommendations">
      <div className="mb-6 flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-3 sm:p-4 transition-all hover:border-amber-500/50 hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-foreground">
              今日のおすすめ
            </div>
            <div className="text-xs text-muted-foreground">
              AIスコア×評価で厳選TOP5
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-amber-500 font-medium text-sm">
          <span className="hidden sm:inline">見る</span>
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}
