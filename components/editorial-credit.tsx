import Link from "next/link";

/**
 * 編集責任主体明示コンポーネント
 *
 * SEO目的:
 * - E-E-A-T「権威性・信頼性」の表示
 * - AI生成コンテンツの責任の所在を明確化（SEO Guide 2026 応用編【1】）
 * - 匿名アフィリエイトサイトとの差別化（応用編【7】）
 *
 * 配置: 各コンテンツページ（作品 / 特集 / 声優 / タグ）の末尾、Footer の直前
 */

interface EditorialCreditProps {
  /** 説明テキストの variant（コンテンツ種別ごとに微調整可能） */
  variant?: "work" | "feature" | "default";
  className?: string;
}

export function EditorialCredit({
  variant = "default",
  className = "",
}: EditorialCreditProps) {
  const description = (() => {
    switch (variant) {
      case "work":
        return "本作品ページの紹介文・要約・おすすめポイント・レビュー要約は、2D-ADB編集部がDLsite・FANZAの公式情報および購入者レビューをもとに、AI（大規模言語モデル）を活用して整理・編集しています。価格・評価・ジャンルなどの事実情報は販売プラットフォームから直接取得しています。最終的な編集判断と公開責任は2D-ADB編集部にあります。";
      case "feature":
        return "本特集ページの構成と紹介文は、2D-ADB編集部が販売実績・評価・サイトコンセプトを踏まえて作成・編集しています。AI（大規模言語モデル）を活用して整理しており、最終的な公開責任は2D-ADB編集部にあります。";
      default:
        return "本ページのコンテンツは、2D-ADB編集部がDLsite・FANZAの公式情報をもとに、AI（大規模言語モデル）を活用して整理・編集しています。最終的な編集判断と公開責任は2D-ADB編集部にあります。";
    }
  })();

  return (
    <aside
      className={`mt-12 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground ${className}`}
      aria-label="編集責任の明示"
    >
      <div className="mb-2 flex items-center gap-1.5 font-bold text-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>編集・運営: 2D-ADB編集部</span>
      </div>
      <p className="leading-relaxed">{description}</p>
      <p className="mt-2">
        編集方針の詳細は{" "}
        <Link
          href="/editorial/"
          className="text-primary underline-offset-2 hover:underline"
        >
          編集方針・運営ポリシー
        </Link>
        {" "}をご覧ください。
      </p>
    </aside>
  );
}
