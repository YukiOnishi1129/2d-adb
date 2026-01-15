/**
 * 検索インデックスJSON生成スクリプト
 * ビルド前に実行して public/data/search-index.json を生成する
 *
 * DATABASE_URL環境変数が必要（.env.localから自動読み込み）
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
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

const OUTPUT_PATH = join(__dirname, "../public/data/search-index.json");

/**
 * DBから全作品を取得
 */
async function getAllWorks(pool) {
  const result = await pool.query(`
    SELECT
      w.id, w.title, c.name as circle_name, w.genre, w.category,
      w.release_date::text, w.dlsite_product_id, w.fanza_product_id,
      w.thumbnail_url, w.price_dlsite, w.price_fanza,
      w.discount_rate_dlsite, w.discount_rate_fanza, w.max_discount_rate,
      w.lowest_price, w.is_on_sale,
      w.ai_tags, w.cv_names,
      w.duration_minutes, w.cg_count,
      w.dlsite_rank, w.fanza_rank,
      w.rating_dlsite, w.rating_fanza,
      w.review_count_dlsite, w.review_count_fanza,
      w.sale_end_date_dlsite, w.sale_end_date_fanza
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true
    ORDER BY w.release_date DESC NULLS LAST
  `);
  return result.rows;
}

/**
 * Work → SearchItem 変換
 */
function convertToSearchItem(work) {
  const isAsmr =
    work.genre?.includes("ボイス") ||
    work.genre?.includes("ASMR") ||
    work.category === "ASMR";
  const cat = isAsmr ? "asmr" : "game";

  // 最安値を使用（セール価格込み）
  const currentPrice =
    work.lowest_price || work.price_dlsite || work.price_fanza || 0;
  // 元の価格を計算（DLsite優先）
  const originalPrice = work.price_dlsite || work.price_fanza || currentPrice;
  const discountRate = work.max_discount_rate || null;

  // プラットフォーム判定
  const hasDlsite = !!work.dlsite_product_id;
  const hasFanza = !!work.fanza_product_id;

  return {
    id: work.id, // DBの数値ID（/works/[id]のルーティングに対応）
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
    // プラットフォーム情報
    dl: hasDlsite, // DLsiteで販売中
    fa: hasFanza, // FANZAで販売中
    // ランキング情報
    dlRank: work.dlsite_rank || null,
    faRank: work.fanza_rank || null,
    // 評価
    rt: work.rating_dlsite || work.rating_fanza || null,
    rc: work.review_count_dlsite || work.review_count_fanza || null,
    // セール終了日（DLsite優先）
    saleEnd: work.sale_end_date_dlsite || work.sale_end_date_fanza || null,
  };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable is required");
    console.log(
      "Usage: DATABASE_URL=postgresql://... node scripts/generate-search-index.mjs",
    );
    process.exit(1);
  }

  console.log("Connecting to database...");
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    console.log("Fetching works from database...");
    const works = await getAllWorks(pool);
    console.log(`Found ${works.length} works`);

    const searchIndex = works.map(convertToSearchItem);

    // ディレクトリ作成
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

    // JSON出力
    writeFileSync(OUTPUT_PATH, JSON.stringify(searchIndex, null, 2), "utf-8");

    console.log(`✓ Generated ${searchIndex.length} items → ${OUTPUT_PATH}`);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
