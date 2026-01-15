import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { getActors } from "@/lib/db";
import { dbActorToActor } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-static";

export default async function CVListPage() {
  const dbActors = await getActors();
  const actors = dbActors.map(dbActorToActor);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb
          items={[{ label: "トップ", href: "/" }, { label: "声優一覧" }]}
        />

        <h1 className="mb-6 text-2xl font-bold text-foreground">声優一覧</h1>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {actors.map((actor) => (
            <Link
              key={actor.name}
              href={`/cv/${encodeURIComponent(actor.name)}`}
            >
              <Card className="group transition-colors hover:border-accent">
                <CardContent className="p-4">
                  <h2 className="mb-1 font-medium text-foreground group-hover:text-accent">
                    {actor.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {actor.workCount}作品に出演
                  </p>
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
