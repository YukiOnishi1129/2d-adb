import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCircles } from "@/lib/db";
import { dbCircleToCircle } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-static";

export default async function CirclesPage() {
  const dbCircles = await getCircles();
  const circles = dbCircles.map(dbCircleToCircle);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb
          items={[{ label: "トップ", href: "/" }, { label: "サークル一覧" }]}
        />

        <h1 className="mb-6 text-2xl font-bold text-foreground">
          サークル一覧
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {circles.map((circle) => (
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
      </main>

      <Footer />
    </div>
  );
}
