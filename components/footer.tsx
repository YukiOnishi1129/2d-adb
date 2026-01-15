import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary py-8">
      <div className="mx-auto max-w-7xl px-6 text-center text-sm text-foreground/60">
        <p className="mb-2">2D-ADB - 二次元コンテンツデータベース</p>
        <div className="mb-4 flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            プライバシーポリシー
          </Link>
          <a
            href="/feed.xml"
            className="hover:text-foreground flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" />
            </svg>
            RSS
          </a>
        </div>
        {/* FANZA API クレジット表記 */}
        <p className="mt-4 text-xs text-foreground/40">
          Powered by{" "}
          <a
            href="https://affiliate.dmm.com/api/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground/60"
          >
            FANZA Webサービス
          </a>
        </p>
      </div>
    </footer>
  );
}
