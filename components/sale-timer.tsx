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
    return { expired: true, days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { expired: false, days, hours, minutes };
}

export function SaleTimer({ endDate, discountRate }: SaleTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeRemaining(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(endDate));
    }, 60000); // 1分ごとに更新

    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.expired) {
    return (
      <Card className="p-4 bg-secondary">
        <p className="text-center text-muted-foreground">セール終了</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
      <div className="flex items-center gap-3">
        <Clock className="h-6 w-6 text-orange-500" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {discountRate && discountRate > 0 && <Badge variant="sale">{discountRate}%OFF</Badge>}
            <span className="text-sm text-muted-foreground">
              セール終了まで
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            {timeLeft.days > 0 && (
              <>
                <span className="text-2xl font-bold text-orange-600">
                  {timeLeft.days}
                </span>
                <span className="text-sm text-muted-foreground">日</span>
              </>
            )}
            <span className="text-2xl font-bold text-orange-600">
              {timeLeft.hours}
            </span>
            <span className="text-sm text-muted-foreground">時間</span>
            <span className="text-2xl font-bold text-orange-600">
              {timeLeft.minutes}
            </span>
            <span className="text-sm text-muted-foreground">分</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
