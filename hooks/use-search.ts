"use client";

import { useState, useEffect, useMemo } from "react";
import {
  type SearchItem,
  type SortType,
  type CategoryFilter,
  type PlatformFilter,
  type PriceFilter,
  searchItems,
  sortItems,
  filterItems,
} from "@/lib/search";

export function useSearch() {
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("new");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<PriceFilter>("all");

  // 検索インデックスを読み込み
  useEffect(() => {
    fetch("/data/search-index.json")
      .then((res) => res.json())
      .then((data: SearchItem[]) => {
        setIndex(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  // 検索・フィルター・ソート適用
  const results = useMemo(() => {
    let items = index;

    // 検索
    items = searchItems(items, query);

    // フィルター
    items = filterItems(items, category, onSaleOnly, platform, maxPrice);

    // ソート
    items = sortItems(items, sortType, platform);

    return items;
  }, [index, query, category, onSaleOnly, sortType, platform, maxPrice]);

  return {
    results,
    isLoading,
    query,
    setQuery,
    sortType,
    setSortType,
    category,
    setCategory,
    platform,
    setPlatform,
    onSaleOnly,
    setOnSaleOnly,
    maxPrice,
    setMaxPrice,
    totalCount: index.length,
    resultCount: results.length,
  };
}
