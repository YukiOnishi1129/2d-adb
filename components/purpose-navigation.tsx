/**
 * 目的別入口ナビゲーション（お困りごと別ご案内）
 *
 * SEO目的:
 * - SEO Guide 2026 応用編【3】1)「お困りごと別ご案内」
 *   トップページ ファーストビューに目的別の入口を置くことで
 *   検索順位が 2〜5位 上昇する実績（著者の現場経験ベース）
 * - Q&A型のナビゲーションで Google にサイト目的を明示
 * - 内部リンクのファーストビュー集約による回遊率UP
 */

import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Moon,
  Mic,
  Flame,
  Sparkles,
  Trophy,
  Gamepad2,
  Heart,
  Search,
} from "lucide-react";

interface PurposeItem {
  icon: typeof Moon;
  label: string;
  description: string;
  href: string;
  /** Tailwind gradient class for icon bg */
  gradient: string;
}

const PURPOSES: PurposeItem[] = [
  {
    icon: Moon,
    label: "寝かしつけ系を聴きたい",
    description: "添い寝・安眠ボイス",
    href: "/tags/%E5%AF%9D%E3%81%8B%E3%81%97%E3%81%A4%E3%81%91",
    gradient: "from-indigo-500/20 to-purple-500/20 text-indigo-500",
  },
  {
    icon: Mic,
    label: "人気声優で選びたい",
    description: "声優別おすすめ作品",
    href: "/cv",
    gradient: "from-pink-500/20 to-rose-500/20 text-pink-500",
  },
  {
    icon: Flame,
    label: "セール中の作品を見たい",
    description: "30%OFF以上の特価作品",
    href: "/sale",
    gradient: "from-red-500/20 to-orange-500/20 text-red-500",
  },
  {
    icon: Sparkles,
    label: "今日のおすすめだけ知りたい",
    description: "編集部の本日の1作品",
    href: "/recommendations",
    gradient: "from-amber-500/20 to-yellow-500/20 text-amber-500",
  },
  {
    icon: Trophy,
    label: "人気ランキングが見たい",
    description: "売上・評価ランキング",
    href: "/search?sort=rank",
    gradient: "from-emerald-500/20 to-teal-500/20 text-emerald-500",
  },
  {
    icon: Gamepad2,
    label: "同人ゲームを探したい",
    description: "RPG・ADV・CG集",
    href: "/search?genre=game&sort=rank",
    gradient: "from-blue-500/20 to-cyan-500/20 text-blue-500",
  },
  {
    icon: Heart,
    label: "高評価の作品だけ知りたい",
    description: "★4.5以上の厳選",
    href: "/search?sort=rating",
    gradient: "from-fuchsia-500/20 to-pink-500/20 text-fuchsia-500",
  },
  {
    icon: Search,
    label: "タグから探したい",
    description: "ジャンル・シチュ別",
    href: "/tags",
    gradient: "from-violet-500/20 to-purple-500/20 text-violet-500",
  },
];

export function PurposeNavigation() {
  return (
    <section
      className="mb-6"
      aria-label="目的別の探し方"
    >
      <h2 className="mb-3 text-base font-bold text-foreground sm:text-lg">
        🎯 何にお困りですか？目的別に探す
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {PURPOSES.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group block"
              aria-label={`${item.label} — ${item.description}`}
            >
              <Card className="h-full p-3 transition-all hover:scale-[1.02] hover:shadow-md">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${item.gradient}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground leading-tight sm:text-sm">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1 sm:text-xs">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
