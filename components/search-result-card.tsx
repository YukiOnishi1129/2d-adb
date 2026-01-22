import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type SearchItem, getUnitPrice } from "@/lib/search";

interface SearchResultCardProps {
  item: SearchItem;
}

function getCategoryLabel(cat: string | null | undefined): string {
  if (!cat) return "";
  switch (cat) {
    case "asmr":
      return "ASMR";
    case "game":
      return "ゲーム";
    default:
      return cat;
  }
}

function getTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "終了";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `残り${days}日`;
  return `残り${hours}時間`;
}

export function SearchResultCard({ item }: SearchResultCardProps) {
  const unitPrice = getUnitPrice(item);
  const hasRating = item.rt && item.rt > 0;
  const hasSaleEnd = item.dr && item.dr > 0 && item.saleEnd;

  return (
    <Link href={`/works/${item.id}`}>
      <Card className="group h-full overflow-hidden transition-colors hover:border-accent">
        {/* サムネイル */}
        <div className="relative">
          <img
            src={item.img}
            alt={item.t}
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
          {item.dr && item.dr > 0 && (
            <Badge variant="sale" className="absolute left-2 top-2">
              {item.dr}%OFF
            </Badge>
          )}
          <Badge variant="secondary" className="absolute right-2 top-2 text-xs">
            {getCategoryLabel(item.cat)}
          </Badge>
        </div>

        <CardContent className="p-3">
          {/* タイトル */}
          <h3 className="mb-1 line-clamp-2 text-sm font-medium text-foreground group-hover:text-accent">
            {item.t}
          </h3>

          {/* サークル */}
          <p className="mb-2 text-xs text-muted-foreground">{item.c}</p>

          {/* 声優 */}
          {item.cv.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {item.cv.slice(0, 2).map((cv) => (
                <Badge key={cv} variant="cv" className="text-xs">
                  {cv}
                </Badge>
              ))}
              {item.cv.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{item.cv.length - 2}
                </span>
              )}
            </div>
          )}

          {/* スペック */}
          <div className="mb-2 text-xs text-muted-foreground">
            {item.cat === "asmr" && item.dur && <span>{item.dur}分</span>}
            {item.cat === "game" && item.cg && <span>CG {item.cg}枚</span>}
          </div>

          {/* 価格 + セール残り時間 */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">
                ¥{item.p.toLocaleString()}
              </span>
              {unitPrice && (
                <span className="text-[10px] font-medium text-primary">
                  ({unitPrice})
                </span>
              )}
            </div>
            {hasSaleEnd && (
              <span className="text-[10px] font-medium text-orange-500">
                {getTimeRemaining(item.saleEnd!)}
              </span>
            )}
          </div>
          {item.dr && item.dr > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              ¥{item.dp.toLocaleString()}
            </span>
          )}

          {/* 評価 */}
          {hasRating && (
            <div className="mt-2 flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = star <= Math.round(item.rt!);
                  return (
                    <svg key={star} className="h-4 w-4" viewBox="0 0 20 20">
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        fill={filled ? "#f59e0b" : "#e5e7eb"}
                        stroke="#ea580c"
                        strokeWidth="0.5"
                      />
                    </svg>
                  );
                })}
              </div>
              <span className="text-xs text-muted-foreground">
                ({item.rc || 0})
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
