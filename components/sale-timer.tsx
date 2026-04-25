"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface SaleTimerProps {
  endDate: string;
  discountRate?: number | null;
}

function calculateTimeRemaining(endDate: string) {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { expired: false, days, hours, minutes, seconds };
}

export function SaleTimer({ endDate, discountRate }: SaleTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeRemaining(endDate));

  // 残り24時間以内なら緊急モード（秒単位更新）
  const isUrgent = !timeLeft.expired && timeLeft.days === 0 && timeLeft.hours < 24;
  // 残り3日以内なら警告モード
  const isWarning = !timeLeft.expired && timeLeft.days <= 3;

  useEffect(() => {
    // 緊急時は1秒ごと、それ以外は1分ごと更新
    const interval = isUrgent ? 1000 : 60000;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(endDate));
    }, interval);

    return () => clearInterval(timer);
  }, [endDate, isUrgent]);

  if (timeLeft.expired) {
    return (
      <Card className="p-4 bg-secondary">
        <p className="text-center text-muted-foreground">セール終了</p>
      </Card>
    );
  }

  // 緊急時: 赤系・点滅・秒表示
  if (isUrgent) {
    return (
      <Card className="border-2 border-red-500 bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-lg dark:from-red-950/40 dark:to-orange-950/40">
        <div className="flex items-center gap-3">
          <Clock className="h-7 w-7 animate-pulse text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {discountRate && discountRate > 0 && (
                <Badge variant="sale" className="animate-pulse">
                  {discountRate}%OFF
                </Badge>
              )}
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                ⚡ まもなく終了
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums text-red-600 dark:text-red-400">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-sm text-muted-foreground">時間</span>
              <span className="text-3xl font-bold tabular-nums text-red-600 dark:text-red-400">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-sm text-muted-foreground">分</span>
              <span className="text-3xl font-bold tabular-nums text-red-600 dark:text-red-400">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-sm text-muted-foreground">秒</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // 警告時（3日以内）: 強調オレンジ
  // 通常時: 普通のオレンジ
  const colorClass = isWarning
    ? "border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/40"
    : "border-orange-200 bg-gradient-to-r from-orange-50 to-red-50";

  return (
    <Card className={`p-4 ${colorClass}`}>
      <div className="flex items-center gap-3">
        <Clock className="h-6 w-6 text-orange-500" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {discountRate && discountRate > 0 && (
              <Badge variant="sale">{discountRate}%OFF</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {isWarning ? "⏳ 終了間近" : "セール終了まで"}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            {timeLeft.days > 0 && (
              <>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {timeLeft.days}
                </span>
                <span className="text-sm text-muted-foreground">日</span>
              </>
            )}
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {timeLeft.hours}
            </span>
            <span className="text-sm text-muted-foreground">時間</span>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {timeLeft.minutes}
            </span>
            <span className="text-sm text-muted-foreground">分</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
