/**
 * ビルド前データ準備スクリプト
 * R2のParquetファイルをダウンロードしてJSONに変換
 *
 * 出力: .cache/data/*.json
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

const CACHE_DIR = join(__dirname, "../.cache/data");

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
  console.log("=== Prebuild Data: Fetching from R2 Parquet ===");

  // キャッシュディレクトリ作成
  mkdirSync(CACHE_DIR, { recursive: true });

  // 全Parquetファイルをダウンロード
  const files = [
    "works.parquet",
    "circles.parquet",
    "voice_actor_features.parquet",
    "feature_recommendations.parquet",
    "daily_recommendations.parquet",
    "sale_features.parquet",
  ];

  // BigIntをNumberに変換するreplacer
  const bigIntReplacer = (_key, value) => {
    if (typeof value === "bigint") {
      return Number(value);
    }
    return value;
  };

  for (const file of files) {
    try {
      const data = await fetchParquet(file);
      const jsonFile = file.replace(".parquet", ".json");
      const outputPath = join(CACHE_DIR, jsonFile);
      writeFileSync(outputPath, JSON.stringify(data, bigIntReplacer), "utf-8");
      console.log(`✓ ${file} -> ${jsonFile} (${data.length} rows)`);
    } catch (error) {
      console.warn(`⚠ ${file}: ${error.message}`);
      // ファイルが存在しない場合は空配列で作成
      const jsonFile = file.replace(".parquet", ".json");
      const outputPath = join(CACHE_DIR, jsonFile);
      writeFileSync(outputPath, "[]", "utf-8");
    }
  }

  console.log("=== Prebuild Data: Complete ===");
}

main().catch(console.error);
