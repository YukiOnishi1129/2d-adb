/**
 * 最終更新日表示コンポーネント
 *
 * SEO目的:
 * - 「コンテンツの情報の鮮度を上げる」(SEO Guide 2026 応用編【11】2))
 * - Google / AI に「最新情報を提供しているサイト」と認識させる
 * - ユーザーへの安心感
 *
 * ビルド時刻を JST で表示する（毎日のparquet exportからのSSGビルドで更新される）
 */

interface LastUpdatedProps {
  /** ラベル文言。デフォルトは「最終更新」 */
  label?: string;
  /** スタイル variant: "inline" | "card" */
  variant?: "inline" | "card";
  className?: string;
}

function getBuildDateJst(): string {
  // SSGビルド時に評価される（new Date() はビルド実行マシンの現在時刻）
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

export function LastUpdated({
  label = "最終更新",
  variant = "inline",
  className = "",
}: LastUpdatedProps) {
  const date = getBuildDateJst();

  if (variant === "card") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          {label}: <time dateTime={date.replace(/\//g, "-")}>{date}</time>
        </span>
      </div>
    );
  }

  return (
    <span className={`text-xs text-muted-foreground ${className}`}>
      {label}: <time dateTime={date.replace(/\//g, "-")}>{date}</time>
    </span>
  );
}
