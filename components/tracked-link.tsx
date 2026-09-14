"use client";

import Link from "next/link";

/**
 * 内部リンクのクリックをGA4に記録するリンク。
 *
 * GA4の拡張計測は外部リンクしか記録しないため、サイト内の回遊
 * （関連作品・声優・サークル・タグなど）がどれだけ使われているかを
 * 計測する手段が無かった。このコンポーネントで補う。
 *
 * イベント名は `internal_click` に統一し、どの導線かは `link_type` で分ける。
 * イベント名を増やすとGA4の探索で横断集計しづらくなるため。
 */

/** 回遊導線の種別。GA4の link_type パラメータとして送る */
export type LinkType =
  | "cv" // 声優ページへ
  | "circle" // サークルページへ
  | "author" // 作家ページへ（コミック系サイト）
  | "tag" // タグページへ
  | "feature" // 特集ページへ
  | "cv_feature" // 声優特集ページへ
  | "work_card_cv" // 同じ声優の人気作カード
  | "work_card_circle" // 同じサークルの人気作カード
  | "work_card_similar" // タグが似ている作品カード
  | "work_card_related" // 関連作品カード
  | "breadcrumb"
  | "other";

interface TrackedLinkProps {
  href: string;
  linkType: LinkType;
  /** 遷移元の作品ID（どの作品ページからの回遊かを見るため） */
  fromWorkId?: number | string;
  /** カードの並び順。上のカードほど押されるのかを見るため */
  position?: number;
  children: React.ReactNode;
  className?: string;
}

export function TrackedLink({
  href,
  linkType,
  fromWorkId,
  position,
  children,
  className,
}: TrackedLinkProps) {
  const handleClick = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "internal_click", {
        link_type: linkType,
        link_url: href,
        from_work_id: fromWorkId,
        position,
        transport_type: "beacon",
      });
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
