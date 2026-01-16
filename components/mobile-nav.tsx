"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Flame, Star, User } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "ホーム" },
  { href: "/search", icon: Search, label: "検索" },
  { href: "/sale", icon: Flame, label: "セール" },
  { href: "/recommendations", icon: Star, label: "おすすめ" },
  { href: "/cv", icon: User, label: "声優" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex h-14 items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* iPhoneのセーフエリア対応 */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}
