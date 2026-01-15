import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

// .env.local を手動で読み込む
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
const SITE_TITLE = "2D-ADB - 同人音声・ASMRデータベース";
const SITE_DESCRIPTION = "同人音声・ASMR作品の新着情報、セール情報をお届け";

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

  try {
    // 新着作品20件を取得
    const result = await pool.query(`
      SELECT
        w.id, w.title, w.thumbnail_url, w.ai_summary, w.ai_recommend_reason,
        w.release_date, w.category,
        w.price_dlsite, w.price_fanza, w.discount_rate_dlsite, w.discount_rate_fanza,
        w.is_on_sale, w.max_discount_rate,
        c.name as circle_name
      FROM works w
      LEFT JOIN circles c ON w.circle_id = c.id
      WHERE w.is_available = true
      ORDER BY w.release_date DESC NULLS LAST, w.id DESC
      LIMIT 20
    `);

    const works = result.rows;
    const now = new Date().toISOString();

    console.log(`[Feed] Generating RSS feed with ${works.length} items`);

    // RSS 2.0 フィードを生成
    const rssItems = works.map((work) => {
      const description = work.ai_summary || work.ai_recommend_reason || `${work.title}の詳細ページ`;
      const saleText = work.is_on_sale && work.max_discount_rate
        ? `【${work.max_discount_rate}%OFF】`
        : "";
      const pubDate = work.release_date
        ? new Date(work.release_date).toUTCString()
        : now;

      return `    <item>
      <title>${escapeXml(saleText + work.title)}</title>
      <link>${BASE_URL}/works/${work.id}/</link>
      <guid isPermaLink="true">${BASE_URL}/works/${work.id}/</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      ${work.category ? `<category>${escapeXml(work.category)}</category>` : ""}
      ${work.thumbnail_url ? `<enclosure url="${escapeXml(work.thumbnail_url)}" type="image/jpeg" />` : ""}
    </item>`;
    });

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${rssItems.join("\n")}
  </channel>
</rss>
`;

    writeFileSync("public/feed.xml", rssFeed);
    console.log(`[Feed] Generated feed.xml with ${works.length} items`);

  } finally {
    await pool.end();
  }
}

main().catch(console.error);
