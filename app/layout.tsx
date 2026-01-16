import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { AgeGate } from "@/components/age-gate";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-JS5JN6JFRZ";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "2D-ADB | ASMR・同人音声の厳選おすすめ作品",
  description:
    "迷ったらここから選べばハズレなし。ASMR・同人音声・同人ゲームの厳選作品を紹介。評価・ランキング・セール情報もまとめてチェック。",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark" suppressHydrationWarning>
      <head>
        {/* テーマ初期化（FOUC防止） */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        {/* RSS Feed */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="2D-ADB 新着情報"
          href="/feed.xml"
        />
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AgeGate />
        {children}
        <MobileNav />
        {/* モバイルナビの高さ分の余白 */}
        <div className="h-14 md:hidden" />
      </body>
    </html>
  );
}
