import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { CircleListContent } from "@/components/circle-list-content";
import { getCircles } from "@/lib/db";
import { dbCircleToCircle } from "@/lib/types";

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
        <p className="mb-4 text-sm text-muted-foreground">
          {circles.length}サークル
        </p>

        <CircleListContent circles={circles} />
      </main>

      <Footer />
    </div>
  );
}
