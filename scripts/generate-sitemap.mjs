import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

// .env.local を手動で読み込む（dotenv不要）
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../.env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=");
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

const { Pool } = pg;

const BASE_URL = "https://2d-adb.com";

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

  try {
    // 各データを取得
    const [workIdsResult, actorNamesResult, tagNamesResult, circleNamesResult] =
      await Promise.all([
        pool.query("SELECT id FROM works WHERE is_available = true"),
        pool.query(`
          SELECT DISTINCT unnest(cv_names) as name
          FROM works
          WHERE is_available = true AND cv_names IS NOT NULL
        `),
        pool.query(`
          SELECT DISTINCT unnest(ai_tags) as name
          FROM works
          WHERE is_available = true AND ai_tags IS NOT NULL
        `),
        pool.query(`
          SELECT DISTINCT c.name FROM circles c
          INNER JOIN works w ON c.id = w.circle_id AND w.is_available = true
        `),
      ]);

    const workIds = workIdsResult.rows.map((r) => r.id);
    const actorNames = actorNamesResult.rows.map((r) => r.name);
    const tagNames = tagNamesResult.rows.map((r) => r.name);
    const circleNames = circleNamesResult.rows.map((r) => r.name);

    console.log(
      `[Sitemap] Works: ${workIds.length}, Actors: ${actorNames.length}, Tags: ${tagNames.length}, Circles: ${circleNames.length}`
    );

    const today = new Date().toISOString().split("T")[0];

    // XMLを生成
    const urls = [];

    // 静的ページ
    const staticPages = [
      { path: "", priority: "1.0", changefreq: "daily" },
      { path: "/works/", priority: "0.9", changefreq: "daily" },
      { path: "/sale/", priority: "0.9", changefreq: "daily" },
      { path: "/sale/tokushu/", priority: "0.9", changefreq: "daily" },
      { path: "/recommendations/", priority: "0.8", changefreq: "daily" },
      { path: "/search/", priority: "0.7", changefreq: "weekly" },
      { path: "/cv/", priority: "0.7", changefreq: "weekly" },
      { path: "/tags/", priority: "0.7", changefreq: "weekly" },
      { path: "/circles/", priority: "0.7", changefreq: "weekly" },
    ];

    for (const page of staticPages) {
      urls.push(`
    <url>
      <loc>${BASE_URL}${page.path}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`);
    }

    // 作品ページ
    for (const id of workIds) {
      urls.push(`
    <url>
      <loc>${BASE_URL}/works/${id}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`);
    }

    // 声優ページ
    for (const name of actorNames) {
      urls.push(`
    <url>
      <loc>${BASE_URL}/cv/${encodeURIComponent(name)}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
    }

    // タグページ
    for (const name of tagNames) {
      urls.push(`
    <url>
      <loc>${BASE_URL}/tags/${encodeURIComponent(name)}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
    }

    // サークルページ
    for (const name of circleNames) {
      urls.push(`
    <url>
      <loc>${BASE_URL}/circles/${encodeURIComponent(name)}/</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}
</urlset>
`;

    writeFileSync("public/sitemap.xml", sitemap);
    console.log(`[Sitemap] Generated with ${urls.length} URLs`);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
