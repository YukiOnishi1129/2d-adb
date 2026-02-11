"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { Circle } from "@/lib/types";

interface CircleListContentProps {
  circles: Circle[];
}

export function CircleListContent({ circles }: CircleListContentProps) {
  const [displayCount, setDisplayCount] = useState(50);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {circles.slice(0, displayCount).map((circle) => (
          <Link
            key={circle.id}
            href={`/circles/${encodeURIComponent(circle.name)}`}
          >
            <Card className="group transition-colors hover:border-accent">
              <CardContent className="p-4">
                <h2 className="mb-2 font-medium text-foreground group-hover:text-accent">
                  {circle.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {circle.mainGenre && (
                    <Badge variant="secondary" className="text-xs">
                      {circle.mainGenre}
                    </Badge>
                  )}
                  <span>{circle.workCount}作品</span>
                </div>
                <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                  {circle.dlsiteId && <span>DLsite</span>}
                  {circle.fanzaId && <span>FANZA</span>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {displayCount < circles.length && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              setDisplayCount((prev) => Math.min(prev + 50, circles.length))
            }
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            もっと見る（残り{circles.length - displayCount}件）
          </Button>
        </div>
      )}
    </>
  );
}
