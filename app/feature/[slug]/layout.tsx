import Script from "next/script";

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

export default function FeatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* インラインスタイルで即座にダークモード適用（FOUC防止） */}
      <style dangerouslySetInnerHTML={{ __html: darkModeStyles }} />
      <Script id="dark-mode-feature" strategy="beforeInteractive">
        {`document.documentElement.classList.add('dark');`}
      </Script>
      {children}
    </>
  );
}
