"use client";

import { useEffect } from "react";

/**
 * ページをダークモードに強制するコンポーネント
 * /sale/tokushu など「今買わせる」ページで使用
 */
export function ForceDarkMode() {
  useEffect(() => {
    document.documentElement.classList.add("dark");

    // クリーンアップ: ページ遷移時にdarkクラスを削除
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return null;
}
