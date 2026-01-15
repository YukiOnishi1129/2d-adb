import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            ページが見つかりません
          </h2>
          <p className="text-muted-foreground mb-8">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">トップページへ</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/search">作品を検索</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
