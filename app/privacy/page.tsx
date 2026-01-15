import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "プライバシーポリシー" },
          ]}
        />

        <h1 className="mb-8 text-2xl font-bold text-foreground">
          プライバシーポリシー
        </h1>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="mb-3 text-lg font-bold">1. はじめに</h2>
            <p className="text-muted-foreground">
              2D-ADB（以下「当サイト」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーでは、当サイトにおける情報の取り扱いについて説明します。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">2. 収集する情報</h2>
            <p className="mb-2 text-muted-foreground">
              当サイトでは、以下の情報を収集する場合があります。
            </p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>
                アクセスログ（IPアドレス、ブラウザ情報、アクセス日時など）
              </li>
              <li>Cookie情報</li>
              <li>ご利用のデバイス情報</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">3. Cookieの使用について</h2>
            <p className="text-muted-foreground">
              当サイトでは、ユーザー体験の向上やアクセス解析のためにCookieを使用しています。ブラウザの設定によりCookieを無効にすることも可能ですが、一部のサービスが正常に動作しない場合があります。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">
              4. アフィリエイトリンクについて
            </h2>
            <p className="text-muted-foreground">
              当サイトは、DLsite・FANZAなどのアフィリエイトプログラムに参加しています。商品リンクをクリックして購入された場合、当サイトは紹介料を受け取ることがあります。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">5. 第三者への情報提供</h2>
            <p className="text-muted-foreground">
              当サイトは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">6. アクセス解析ツール</h2>
            <p className="text-muted-foreground">
              当サイトでは、Googleアナリティクス等のアクセス解析ツールを使用する場合があります。これらのツールはトラフィックデータの収集のためにCookieを使用しています。収集されるデータは匿名であり、個人を特定するものではありません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">7. ポリシーの変更</h2>
            <p className="text-muted-foreground">
              当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。変更後のポリシーは、当ページに掲載した時点で効力を生じます。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">8. お問い合わせ</h2>
            <p className="text-muted-foreground">
              本ポリシーに関するお問い合わせは、サイト運営者までご連絡ください。
            </p>
          </section>
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          制定日: 2025年1月1日
        </p>
      </main>

      <Footer />
    </div>
  );
}
