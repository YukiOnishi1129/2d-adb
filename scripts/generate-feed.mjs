/**
 * RSSフィード生成スクリプト
 * R2のParquetファイルからデータを取得
 */

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readParquet } from "parquet-wasm";
import { tableFromIPC } from "apache-arrow";

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

// R2の公開ドメイン（環境変数から取得、必須）
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || "";
if (!R2_PUBLIC_DOMAIN) {
  console.error("ERROR: R2_PUBLIC_DOMAIN environment variable is required");
  process.exit(1);
}

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

/**
 * ParquetファイルをR2からダウンロードしてパースする
 */
async function fetchParquet(filename) {
  const url = `${R2_PUBLIC_DOMAIN}/parquet/${filename}`;
  console.log(`Fetching: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();

  // parquet-wasmでParquetを読み込み、IPC形式に変換
  const wasmTable = readParquet(new Uint8Array(buffer));
  const ipcBuffer = wasmTable.intoIPCStream();

  // apache-arrowでIPCを読み込み
  const arrowTable = tableFromIPC(ipcBuffer);

  const rows = [];

  for (let i = 0; i < arrowTable.numRows; i++) {
    const row = {};
    for (const field of arrowTable.schema.fields) {
      const column = arrowTable.getChild(field.name);
      if (column) {
        let value = column.get(i);
        if (typeof value === "bigint") {
          value = Number(value);
        }
        if (
          typeof value === "string" &&
          (value.startsWith("[") || value.startsWith("{"))
        ) {
          try {
            value = JSON.parse(value);
          } catch {
            // パース失敗時はそのまま
          }
        }
        row[field.name] = value;
      }
    }
    rows.push(row);
  }

  return rows;
}

async function main() {
  console.log("Fetching data from R2 Parquet...");

  const [works, circles] = await Promise.all([
    fetchParquet("works.parquet"),
    fetchParquet("circles.parquet"),
  ]);

  // サークル名マップを作成
  const circleMap = new Map(circles.map((c) => [c.id, c.name]));

  // 新着作品20件を取得
  const availableWorks = works
    .filter((w) => w.is_available !== false)
    .map((w) => ({
      ...w,
      circle_name: w.circle_id ? circleMap.get(w.circle_id) || null : null,
    }))
    .sort((a, b) => {
      const dateA = a.release_date || "";
      const dateB = b.release_date || "";
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return b.id - a.id;
    })
    .slice(0, 20);

  const now = new Date().toISOString();

  console.log(`[Feed] Generating RSS feed with ${availableWorks.length} items`);

  // RSS 2.0 フィードを生成
  const rssItems = availableWorks.map((work) => {
    const description =
      work.ai_summary || work.ai_recommend_reason || `${work.title}の詳細ページ`;
    const saleText =
      work.is_on_sale && work.max_discount_rate
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
  console.log(`[Feed] Generated feed.xml with ${availableWorks.length} items`);
}

main().catch(console.error);
