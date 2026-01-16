import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "今日のおすすめ作品 | 2D-ADB",
  description: "迷ったらここから選べばハズレなし。ASMR・ゲームの厳選10作品を毎日更新。",
  openGraph: {
    title: "今日のおすすめ作品 | 2D-ADB",
    description: "迷ったらここから選べばハズレなし。ASMR・ゲームの厳選10作品を毎日更新。",
    images: [
      { url: "https://2d-adb.com/ogp/recommendation_ogp.png", width: 1200, height: 630 },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "今日のおすすめ作品 | 2D-ADB",
    description: "迷ったらここから選べばハズレなし。ASMR・ゲームの厳選10作品を毎日更新。",
    images: ["https://2d-adb.com/ogp/recommendation_ogp.png"],
  },
};

// ダークモードのCSS変数（globals.cssの.darkと同じ）
const darkModeStyles = `
  :root {
    --background: #0b0e14 !important;
    --foreground: #e4e4e7 !important;
    --card: #12161f !important;
    --card-foreground: #e4e4e7 !important;
    --popover: #12161f !important;
    --popover-foreground: #e4e4e7 !important;
    --primary: #60a5fa !important;
    --primary-foreground: #0b0e14 !important;
    --secondary: #1a1f2a !important;
    --secondary-foreground: #e4e4e7 !important;
    --muted: #1a1f2a !important;
    --muted-foreground: #9ca3af !important;
    --accent: #818cf8 !important;
    --accent-foreground: #0b0e14 !important;
    --border: #27303d !important;
    --input: #27303d !important;
    --ring: #818cf8 !important;
    --badge-cv: #1e3a5f !important;
    --badge-cv-foreground: #93c5fd !important;
    --badge-tag: #312e81 !important;
    --badge-tag-foreground: #c4b5fd !important;
  }
`;

export default function RecommendationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* インラインスタイルで即座にダークモード適用（FOUC防止） */}
      <style dangerouslySetInnerHTML={{ __html: darkModeStyles }} />
      <Script id="dark-mode-recommendations" strategy="beforeInteractive">
        {`document.documentElement.classList.add('dark');`}
      </Script>
      {children}
    </>
  );
}
