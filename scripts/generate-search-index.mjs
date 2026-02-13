/**
 * 検索インデックスJSON生成スクリプト
 * ビルド前に実行して public/data/search-index.json を生成する
 *
 * R2のParquetファイルからデータを取得
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
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

const OUTPUT_PATH = join(__dirname, "../public/data/search-index.json");

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

/**
 * Work → SearchItem 変換
 */
function convertToSearchItem(work) {
  // genreがある場合はgenreを優先
  let isAsmr;
  if (work.genre) {
    isAsmr =
      work.genre.includes("音声") ||
      work.genre.includes("ボイス") ||
      work.genre.includes("ASMR");
  } else {
    // genreがない場合のみcategoryにフォールバック
    isAsmr = work.category === "ASMR" || work.category === "音声作品";
  }
  const cat = isAsmr ? "asmr" : "game";

  const currentPrice =
    work.lowest_price || work.price_dlsite || work.price_fanza || 0;
  const originalPrice = work.price_dlsite || work.price_fanza || currentPrice;
  const discountRate = work.max_discount_rate || null;

  const hasDlsite = !!work.dlsite_product_id;
  const hasFanza = !!work.fanza_product_id;

  return {
    id: work.id,
    t: work.title,
    c: work.circle_name || "",
    cv: work.cv_names || [],
    tg: work.ai_tags || [],
    p: currentPrice,
    dp: originalPrice,
    dr: discountRate,
    img: work.thumbnail_url || "",
    cat,
    ...(cat === "asmr" && work.duration_minutes
      ? { dur: work.duration_minutes }
      : {}),
    ...(cat === "game" && work.cg_count ? { cg: work.cg_count } : {}),
    rel: work.release_date || "",
    dl: hasDlsite,
    fa: hasFanza,
    dlRank: work.dlsite_rank || null,
    faRank: work.fanza_rank || null,
    rt: work.rating_dlsite || work.rating_fanza || null,
    rc: work.review_count_dlsite || work.review_count_fanza || null,
    saleEnd: work.sale_end_date_dlsite || work.sale_end_date_fanza || null,
  };
}

async function main() {
  console.log("Fetching works from R2 Parquet...");

  // 作品データとサークルデータを取得
  const [works, circles] = await Promise.all([
    fetchParquet("works.parquet"),
    fetchParquet("circles.parquet"),
  ]);

  console.log(`Found ${works.length} works, ${circles.length} circles`);

  // サークル名を付与
  const circleMap = new Map(circles.map((c) => [c.id, c.name]));
  const enrichedWorks = works
    .filter((w) => w.is_available !== false)
    .map((w) => ({
      ...w,
      circle_name: w.circle_id ? circleMap.get(w.circle_id) || null : null,
    }))
    .sort((a, b) => {
      const dateA = a.release_date || "";
      const dateB = b.release_date || "";
      return dateB.localeCompare(dateA);
    });

  const searchIndex = enrichedWorks.map(convertToSearchItem);

  // ディレクトリ作成
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

  // JSON出力
  writeFileSync(OUTPUT_PATH, JSON.stringify(searchIndex, null, 2), "utf-8");

  console.log(`✓ Generated ${searchIndex.length} items → ${OUTPUT_PATH}`);
}

main().catch(console.error);
