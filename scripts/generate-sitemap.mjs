/**
 * サイトマップ生成スクリプト
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

  // 利用可能な作品のみ
  const availableWorks = works.filter((w) => w.is_available !== false);

  // 作品ID一覧
  const workIds = availableWorks.map((w) => w.id);

  // 声優名一覧
  const actorNames = new Set();
  for (const work of availableWorks) {
    if (work.cv_names) {
      for (const name of work.cv_names) {
        actorNames.add(name);
      }
    }
  }

  // タグ一覧
  const tagNames = new Set();
  for (const work of availableWorks) {
    if (work.ai_tags) {
      for (const tag of work.ai_tags) {
        tagNames.add(tag);
      }
    }
  }

  // サークル一覧（作品があるもののみ）
  const circleIdsWithWorks = new Set(
    availableWorks.map((w) => w.circle_id).filter((id) => id !== null)
  );
  const circleNames = circles
    .filter((c) => circleIdsWithWorks.has(c.id))
    .map((c) => c.name);

  console.log(
    `[Sitemap] Works: ${workIds.length}, Actors: ${actorNames.size}, Tags: ${tagNames.size}, Circles: ${circleNames.length}`
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
}

main().catch(console.error);
