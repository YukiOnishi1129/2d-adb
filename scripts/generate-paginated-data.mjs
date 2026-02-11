/**
 * タグ・CV別のページ分割JSONを生成するスクリプト
 *
 * 出力:
 *   public/data/tags/{tagName}/{page}.json
 *   public/data/cv/{cvName}/{page}.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, "../.cache/data");
const OUTPUT_DIR = join(__dirname, "../public/data");

const PAGE_SIZE = 20;

/**
 * 作品データをWork型に変換（フロントエンドで使う形式）
 */
function dbWorkToWork(dbWork) {
  return {
    id: dbWork.id,
    title: dbWork.title,
    circleName: dbWork.circle_name,
    thumbnailUrl: dbWork.thumbnail_url,
    priceDlsite: dbWork.price_dlsite,
    priceFanza: dbWork.price_fanza,
    discountRateDlsite: dbWork.discount_rate_dlsite,
    discountRateFanza: dbWork.discount_rate_fanza,
    saleEndDateDlsite: dbWork.sale_end_date_dlsite,
    saleEndDateFanza: dbWork.sale_end_date_fanza,
    ratingDlsite: dbWork.rating_dlsite,
    ratingFanza: dbWork.rating_fanza,
    reviewCountDlsite: dbWork.review_count_dlsite,
    reviewCountFanza: dbWork.review_count_fanza,
    isOnSale: dbWork.is_on_sale,
    maxDiscountRate: dbWork.max_discount_rate,
    category: dbWork.category,
    actors: dbWork.actors || [],
    aiTags: dbWork.ai_tags || [],
    killerWords: dbWork.killer_words || {},
  };
}

/**
 * ファイル名に使えない文字をエスケープ
 */
function sanitizeFileName(name) {
  return encodeURIComponent(name);
}

async function main() {
  console.log("=== Generate Paginated Data ===");

  // キャッシュからworks.jsonを読み込み
  const worksPath = join(CACHE_DIR, "works.json");
  if (!existsSync(worksPath)) {
    console.error("ERROR: works.json not found. Run prebuild-data.mjs first.");
    process.exit(1);
  }

  const works = JSON.parse(readFileSync(worksPath, "utf-8"));
  console.log(`Loaded ${works.length} works`);

  // タグ別にグループ化
  const tagGroups = new Map();
  for (const work of works) {
    const tags = work.ai_tags || [];
    for (const tag of tags) {
      if (!tagGroups.has(tag)) {
        tagGroups.set(tag, []);
      }
      tagGroups.get(tag).push(work);
    }
  }

  // CV別にグループ化
  const cvGroups = new Map();
  for (const work of works) {
    const actors = work.actors || [];
    for (const actor of actors) {
      if (!cvGroups.has(actor)) {
        cvGroups.set(actor, []);
      }
      cvGroups.get(actor).push(work);
    }
  }

  // タグ別JSONを生成
  const tagsDir = join(OUTPUT_DIR, "tags");
  mkdirSync(tagsDir, { recursive: true });

  let tagFileCount = 0;
  for (const [tag, tagWorks] of tagGroups) {
    // 100件以下のタグはスキップ（SSGで十分）
    if (tagWorks.length <= 100) continue;

    const tagDir = join(tagsDir, sanitizeFileName(tag));
    mkdirSync(tagDir, { recursive: true });

    // ページ分割
    const totalPages = Math.ceil(tagWorks.length / PAGE_SIZE);
    for (let page = 1; page <= totalPages; page++) {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const pageWorks = tagWorks.slice(start, end).map(dbWorkToWork);

      const filePath = join(tagDir, `${page}.json`);
      writeFileSync(filePath, JSON.stringify(pageWorks), "utf-8");
      tagFileCount++;
    }
  }

  // CV別JSONを生成
  const cvDir = join(OUTPUT_DIR, "cv");
  mkdirSync(cvDir, { recursive: true });

  let cvFileCount = 0;
  for (const [cv, cvWorks] of cvGroups) {
    // 100件以下のCVはスキップ（SSGで十分）
    if (cvWorks.length <= 100) continue;

    const actorDir = join(cvDir, sanitizeFileName(cv));
    mkdirSync(actorDir, { recursive: true });

    // ページ分割
    const totalPages = Math.ceil(cvWorks.length / PAGE_SIZE);
    for (let page = 1; page <= totalPages; page++) {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const pageWorks = cvWorks.slice(start, end).map(dbWorkToWork);

      const filePath = join(actorDir, `${page}.json`);
      writeFileSync(filePath, JSON.stringify(pageWorks), "utf-8");
      cvFileCount++;
    }
  }

  // サークル別にグループ化
  const circleGroups = new Map();
  for (const work of works) {
    const circleName = work.circle_name;
    if (!circleName) continue;
    if (!circleGroups.has(circleName)) {
      circleGroups.set(circleName, []);
    }
    circleGroups.get(circleName).push(work);
  }

  // サークル別JSONを生成
  const circlesDir = join(OUTPUT_DIR, "circles");
  mkdirSync(circlesDir, { recursive: true });

  let circleFileCount = 0;
  for (const [circleName, circleWorks] of circleGroups) {
    // 100件以下のサークルはスキップ（SSGで十分）
    if (circleWorks.length <= 100) continue;

    const circleDir = join(circlesDir, sanitizeFileName(circleName));
    mkdirSync(circleDir, { recursive: true });

    // ページ分割
    const totalPages = Math.ceil(circleWorks.length / PAGE_SIZE);
    for (let page = 1; page <= totalPages; page++) {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const pageWorks = circleWorks.slice(start, end).map(dbWorkToWork);

      const filePath = join(circleDir, `${page}.json`);
      writeFileSync(filePath, JSON.stringify(pageWorks), "utf-8");
      circleFileCount++;
    }
  }

  console.log(`✓ Generated ${tagFileCount} tag page files`);
  console.log(`✓ Generated ${cvFileCount} cv page files`);
  console.log(`✓ Generated ${circleFileCount} circle page files`);
  console.log("=== Generate Paginated Data: Complete ===");
}

main().catch(console.error);
