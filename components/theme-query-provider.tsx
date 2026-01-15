"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * URLクエリパラメータ ?theme=dark でダークモードを適用するコンポーネント
 * X投稿などの深夜向けリンクで使用
 */
export function ThemeQueryProvider() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const theme = searchParams.get("theme");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }

    // クリーンアップ: ページ遷移時にdarkクラスを削除
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [searchParams]);

  return null;
}
