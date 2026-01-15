import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";

export function TokushuBanner() {
  return (
    <Link href="/sale/tokushu">
      <div className="mb-6 flex items-center justify-between rounded-lg bg-gradient-to-r from-sale/10 via-sale/5 to-transparent border border-sale/30 p-3 sm:p-4 transition-all hover:border-sale/50 hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sale/20">
            <Sparkles className="h-5 w-5 text-sale" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-foreground">
              今日のセール特集
            </div>
            <div className="text-xs text-muted-foreground">
              厳選おすすめ作品をチェック
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sale font-medium text-sm">
          <span className="hidden sm:inline">見る</span>
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}
