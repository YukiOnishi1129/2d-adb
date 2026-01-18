"use client";

import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

// URLからproduct_idを抽出
function extractProductId(url: string, platform: "dlsite" | "fanza"): string | undefined {
  if (platform === "dlsite") {
    // DLsite: /product_id/RJ01234567.html or /RJ01234567
    const match = url.match(/RJ\d+/i);
    return match ? match[0].toUpperCase() : undefined;
  } else {
    // FANZA: /cid=d_123456/ or similar
    const match = url.match(/d_\d+/);
    return match ? match[0] : undefined;
  }
}

interface AffiliateLinkProps {
  platform: "dlsite" | "fanza";
  url: string;
  productId?: string;
  workId?: number;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  disabled?: boolean;
}

export function AffiliateLink({
  platform,
  url,
  productId,
  workId,
  children,
  className,
  size = "sm",
  variant = "outline",
  disabled = false,
}: AffiliateLinkProps) {
  const handleClick = () => {
    if (typeof window !== "undefined" && window.gtag) {
      // productIdが渡されなければURLから抽出
      const pid = productId || extractProductId(url, platform);
      window.gtag("event", `${platform}_click`, {
        product_id: pid,
        work_id: workId,
      });
    }
  };

  if (disabled) {
    return (
      <Button size={size} variant={variant} disabled className={className}>
        {children}
      </Button>
    );
  }

  return (
    <Button size={size} variant={variant} asChild className={className}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        {children}
      </a>
    </Button>
  );
}
