import Fuse, { type IFuseOptions } from "fuse.js";

export type SearchItem = {
  id: string;
  t: string; // タイトル
  c: string; // サークル名
  cv: string[]; // 声優リスト
  tg: string[]; // タグ名リスト
  p: number; // 現在価格
  dp: number; // 定価
  dr: number | null; // 割引率
  img: string; // サムネイルURL
  cat: "asmr" | "game"; // ジャンル
  dur?: number; // ASMRのみ：収録分数
  cg?: number; // ゲームのみ：CG枚数
  rel: string; // 発売日
  // プラットフォーム情報
  dl?: boolean; // DLsiteで販売中
  fa?: boolean; // FANZAで販売中
  dlRank?: number | null; // DLsiteランキング順位
  faRank?: number | null; // FANZAランキング順位
  // 評価
  rt?: number | null; // 評価点
  rc?: number | null; // レビュー件数
  // セール終了日
  saleEnd?: string | null;
};

export type SortType =
  | "new"
  | "discount"
  | "price"
  | "cospa"
  | "rank"
  | "rating";
export type CategoryFilter = "all" | "asmr" | "game";
export type PlatformFilter = "all" | "dlsite" | "fanza";
export type PriceFilter = "all" | "100" | "300" | "500" | "1000" | "2000";

// Fuse.js設定
const fuseOptions: IFuseOptions<SearchItem> = {
  keys: [
    { name: "t", weight: 1.0 }, // タイトル
    { name: "cv", weight: 0.8 }, // 声優
    { name: "c", weight: 0.5 }, // サークル
    { name: "tg", weight: 0.3 }, // タグ
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
};

// 検索実行
export function searchItems(items: SearchItem[], query: string): SearchItem[] {
  if (!query.trim()) {
    return items;
  }

  const fuse = new Fuse(items, fuseOptions);

  // スペース区切りでAND検索
  const terms = query.trim().split(/\s+/);

  if (terms.length === 1) {
    return fuse.search(terms[0]).map((r) => r.item);
  }

  // 複数ワードの場合はAND検索
  let results = items;
  for (const term of terms) {
    const termFuse = new Fuse(results, fuseOptions);
    results = termFuse.search(term).map((r) => r.item);
  }
  return results;
}

// ソート
export function sortItems(
  items: SearchItem[],
  sortType: SortType,
  platform: PlatformFilter = "all",
): SearchItem[] {
  const sorted = [...items];

  switch (sortType) {
    case "new":
      return sorted.sort(
        (a, b) => new Date(b.rel).getTime() - new Date(a.rel).getTime(),
      );
    case "discount":
      return sorted.sort((a, b) => (b.dr ?? 0) - (a.dr ?? 0));
    case "price":
      return sorted.sort((a, b) => a.p - b.p);
    case "cospa":
      return sorted.sort((a, b) => {
        const costA =
          a.cat === "asmr" && a.dur
            ? a.p / a.dur
            : a.cat === "game" && a.cg
              ? a.p / a.cg
              : Infinity;
        const costB =
          b.cat === "asmr" && b.dur
            ? b.p / b.dur
            : b.cat === "game" && b.cg
              ? b.p / b.cg
              : Infinity;
        return costA - costB;
      });
    case "rank":
      // プラットフォームに応じたランキング順
      return sorted.sort((a, b) => {
        const rankA =
          platform === "fanza"
            ? (a.faRank ?? Infinity)
            : (a.dlRank ?? Infinity);
        const rankB =
          platform === "fanza"
            ? (b.faRank ?? Infinity)
            : (b.dlRank ?? Infinity);
        return rankA - rankB;
      });
    case "rating":
      // 評価が高い順
      return sorted.sort((a, b) => (b.rt ?? 0) - (a.rt ?? 0));
    default:
      return sorted;
  }
}

// フィルター
export function filterItems(
  items: SearchItem[],
  category: CategoryFilter,
  onSaleOnly: boolean,
  platform: PlatformFilter = "all",
  maxPrice: PriceFilter = "all",
): SearchItem[] {
  let filtered = items;

  if (category !== "all") {
    filtered = filtered.filter((item) => item.cat === category);
  }

  if (onSaleOnly) {
    filtered = filtered.filter((item) => item.dr !== null && item.dr > 0);
  }

  if (platform === "dlsite") {
    filtered = filtered.filter((item) => item.dl === true);
  } else if (platform === "fanza") {
    filtered = filtered.filter((item) => item.fa === true);
  }

  if (maxPrice !== "all") {
    const limit = parseInt(maxPrice, 10);
    filtered = filtered.filter((item) => item.p <= limit);
  }

  return filtered;
}

// 単価計算
export function getUnitPrice(item: SearchItem): string | null {
  if (item.cat === "asmr" && item.dur) {
    const unitPrice = Math.round(item.p / item.dur);
    return `${unitPrice}円/分`;
  }
  if (item.cat === "game" && item.cg) {
    const unitPrice = Math.round(item.p / item.cg);
    return `${unitPrice}円/枚`;
  }
  return null;
}
