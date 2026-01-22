/**
 * データローダー
 *
 * prebuild-data.mjsで生成されたJSONキャッシュからデータを読み込む。
 * ビルド時に一度だけ読み込んでメモリにキャッシュする。
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// キャッシュディレクトリのパス
const CACHE_DIR = join(process.cwd(), ".cache/data");

// キャッシュ用
let worksCache: DbWork[] | null = null;
let circlesCache: DbCircle[] | null = null;
let voiceActorFeaturesCache: DbVoiceActorFeature[] | null = null;
let featureRecommendationsCache: DbFeatureRecommendation[] | null = null;
let dailyRecommendationsCache: DbDailyRecommendation[] | null = null;
let saleFeaturesCache: DbSaleFeature[] | null = null;

// 型定義
export interface DbWork {
  id: number;
  circle_id: number | null;
  circle_name: string | null;
  title: string;
  genre: string | null;
  category: string | null;
  release_date: string | null;
  dlsite_product_id: string | null;
  dlsite_url: string | null;
  fanza_url: string | null;
  fanza_product_id: string | null;
  thumbnail_url: string | null;
  sample_images: string | string[] | null;
  price_dlsite: number | null;
  price_fanza: number | null;
  discount_rate_dlsite: number | null;
  discount_rate_fanza: number | null;
  sale_end_date_dlsite: string | null;
  sale_end_date_fanza: string | null;
  lowest_price: number | null;
  max_discount_rate: number | null;
  is_on_sale: boolean;
  dlsite_rank: number | null;
  fanza_rank: number | null;
  dlsite_rank_date: string | null;
  fanza_rank_date: string | null;
  ai_summary: string | null;
  ai_recommend_reason: string | null;
  ai_click_title: string | null;
  ai_tags: string[] | null;
  ai_target_audience: string | null;
  ai_appeal_points: string | null;
  ai_warnings: string | null;
  ai_review: string | null;
  cv_names: string[] | null;
  duration_minutes: number | null;
  situations: string[] | null;
  fetish_tags: string[] | null;
  cg_count: number | null;
  cg_diff_count: number | null;
  h_scene_count: number | null;
  play_time_hours: number | null;
  game_features: string[] | null;
  rating_dlsite: number | null;
  rating_fanza: number | null;
  review_count_dlsite: number | null;
  review_count_fanza: number | null;
  user_reviews: string | UserReview[] | null;
  is_available: boolean;
}

// user_reviews内のレビュー型
export interface UserReview {
  rating: number;
  text: string;
  date?: string | null;
  is_purchased?: boolean;
  helpful_count?: number;
  title?: string | null;
}

export interface DbCircle {
  id: number;
  name: string;
  dlsite_id: string | null;
  fanza_id: string | null;
  main_genre: string | null;
  work_count: number;
}

export interface DbVoiceActorFeature {
  id: number;
  name: string;
  slug: string;
  headline: string | null;
  description: string | null;
  representative_work_id: number | null;
  representative_thumbnail_url: string | null;
  recommended_works:
    | {
        work_id: number;
        reason: string;
        target_audience: string;
        thumbnail_url?: string;
      }[]
    | null;
  sale_works:
    | { work_id: number; discount_rate: number; thumbnail_url?: string }[]
    | null;
  total_work_count: number;
  solo_work_count: number;
  avg_rating: number | null;
  sale_count: number;
  platform: string;
  is_active: boolean;
  updated_at: string;
}

export interface DbFeatureRecommendation {
  id: number;
  slug: string;
  name: string;
  headline: string | null;
  description: string | null;
  asmr_works:
    | {
        work_id: number;
        reason: string;
        target_audience: string;
        thumbnail_url?: string;
      }[]
    | null;
  game_works:
    | {
        work_id: number;
        reason: string;
        target_audience: string;
        thumbnail_url?: string;
      }[]
    | null;
  thumbnail_url: string | null;
  asmr_count: number;
  game_count: number;
  updated_at: string;
}

export interface DbDailyRecommendation {
  id: number;
  target_date: string;
  headline: string | null;
  asmr_works:
    | { work_id: number; reason: string; target_audience: string }[]
    | null;
  game_works:
    | { work_id: number; reason: string; target_audience: string }[]
    | null;
  total_works_count: number;
  asmr_count: number;
  game_count: number;
}

export interface DbSaleFeature {
  id: number;
  target_date: string;
  main_work_id: number | null;
  main_headline: string | null;
  main_reason: string | null;
  main_category: string | null;
  sub1_work_id: number | null;
  sub1_one_liner: string | null;
  sub1_category: string | null;
  sub2_work_id: number | null;
  sub2_one_liner: string | null;
  sub2_category: string | null;
  cheapest_work_ids: number[] | null;
  high_discount_work_ids: number[] | null;
  high_rating_work_ids: number[] | null;
  total_sale_count: number;
  dlsite_count: number;
  fanza_count: number;
  max_discount_rate: number;
  ogp_image_url: string | null;
}

/**
 * JSONキャッシュファイルを読み込む
 */
function loadJson<T>(filename: string): T[] {
  const filePath = join(CACHE_DIR, filename);
  if (!existsSync(filePath)) {
    console.warn(`Cache file not found: ${filePath}`);
    return [];
  }
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T[];
}

/**
 * 作品データを取得（キャッシュ付き）
 */
export async function getWorks(): Promise<DbWork[]> {
  if (worksCache === null) {
    worksCache = loadJson<DbWork>("works.json");
    console.log(`Loaded ${worksCache.length} works from cache`);
  }
  return worksCache;
}

/**
 * サークルデータを取得（キャッシュ付き）
 */
export async function getCirclesData(): Promise<DbCircle[]> {
  if (circlesCache === null) {
    circlesCache = loadJson<DbCircle>("circles.json");
    console.log(`Loaded ${circlesCache.length} circles from cache`);
  }
  return circlesCache;
}

/**
 * 声優特集データを取得（キャッシュ付き）
 */
export async function getVoiceActorFeaturesData(): Promise<
  DbVoiceActorFeature[]
> {
  if (voiceActorFeaturesCache === null) {
    voiceActorFeaturesCache = loadJson<DbVoiceActorFeature>(
      "voice_actor_features.json"
    );
    console.log(
      `Loaded ${voiceActorFeaturesCache.length} voice actor features from cache`
    );
  }
  return voiceActorFeaturesCache;
}

/**
 * 特集おすすめデータを取得（キャッシュ付き）
 */
export async function getFeatureRecommendationsData(): Promise<
  DbFeatureRecommendation[]
> {
  if (featureRecommendationsCache === null) {
    featureRecommendationsCache = loadJson<DbFeatureRecommendation>(
      "feature_recommendations.json"
    );
    console.log(
      `Loaded ${featureRecommendationsCache.length} feature recommendations from cache`
    );
  }
  return featureRecommendationsCache;
}

/**
 * デイリーおすすめデータを取得（キャッシュ付き）
 */
export async function getDailyRecommendationsData(): Promise<
  DbDailyRecommendation[]
> {
  if (dailyRecommendationsCache === null) {
    dailyRecommendationsCache = loadJson<DbDailyRecommendation>(
      "daily_recommendations.json"
    );
    console.log(
      `Loaded ${dailyRecommendationsCache.length} daily recommendations from cache`
    );
  }
  return dailyRecommendationsCache;
}

/**
 * セール特集データを取得（キャッシュ付き）
 */
export async function getSaleFeaturesData(): Promise<DbSaleFeature[]> {
  if (saleFeaturesCache === null) {
    saleFeaturesCache = loadJson<DbSaleFeature>("sale_features.json");
    console.log(`Loaded ${saleFeaturesCache.length} sale features from cache`);
  }
  return saleFeaturesCache;
}

/**
 * キャッシュをクリアする（テスト用）
 */
export function clearCache(): void {
  worksCache = null;
  circlesCache = null;
  voiceActorFeaturesCache = null;
  featureRecommendationsCache = null;
  dailyRecommendationsCache = null;
  saleFeaturesCache = null;
}
