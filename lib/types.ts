// キラーワード（ジャンル別スペック情報）
export interface KillerWords {
  // 音声・ASMR用
  cvNames: string[] | null;
  durationMinutes: number | null;
  situations: string[] | null;
  fetishTags: string[] | null;
  // ゲーム用
  cgCount: number | null;
  cgDiffCount: number | null;
  hSceneCount: number | null;
  playTimeHours: number | null;
  gameFeatures: string[] | null;
}

export type WorkCategory = "ASMR" | "ゲーム" | "CG集" | "動画" | "音声作品";

export interface Work {
  id: number;
  circleId: number | null;
  circleName: string | null;
  title: string;
  genre: string | null;
  category: WorkCategory | string | null;
  releaseDate: string | null;
  dlsiteProductId: string | null;
  dlsiteUrl: string | null;
  fanzaUrl: string | null;
  thumbnailUrl: string | null;
  sampleImages: string[];
  priceDlsite: number | null;
  priceFanza: number | null;
  // プラットフォーム別セール情報
  discountRateDlsite: number | null;
  discountRateFanza: number | null;
  saleEndDateDlsite: string | null;
  saleEndDateFanza: string | null;
  // 集計値（ソート用）
  lowestPrice: number | null;
  maxDiscountRate: number | null;
  isOnSale: boolean;
  // ランキング情報
  dlsiteRank: number | null;
  fanzaRank: number | null;
  dlsiteRankDate: string | null;
  fanzaRankDate: string | null;
  // AI生成データ
  aiSummary: string | null;
  aiRecommendReason: string | null;
  aiClickTitle: string | null;
  aiTags: string[];
  aiTargetAudience: string | null;
  aiAppealPoints: string | null;
  aiWarnings: string | null;
  aiReview: string | null;
  actors: string[];
  killerWords: KillerWords;
  // 評価・レビュー情報
  ratingDlsite: number | null;
  ratingFanza: number | null;
  reviewCountDlsite: number | null;
  reviewCountFanza: number | null;
  userReviews: UserReview[];
}

// ユーザーレビュー
export interface UserReview {
  rating: number;
  text: string;
  date?: string | null;
  is_purchased?: boolean;
  helpful_count?: number;
  title?: string | null;
}

export interface Circle {
  id: number;
  name: string;
  dlsiteId: string | null;
  fanzaId: string | null;
  mainGenre: string | null;
  workCount: number;
}

export interface Actor {
  name: string;
  workCount: number;
}

export interface Tag {
  name: string;
  workCount: number;
}

// DBからの変換ヘルパー
import type { DbWork, DbCircle, DbActor, DbTag } from "./db";

// sample_imagesは文字列（JSON）または配列の両方に対応
function parseSampleImages(
  value: string | string[] | null | undefined
): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

// user_reviewsは文字列（JSON）または配列の両方に対応
function parseUserReviews(
  value: string | UserReview[] | null | undefined
): UserReview[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

export function dbWorkToWork(dbWork: DbWork): Work {
  return {
    id: dbWork.id,
    circleId: dbWork.circle_id,
    circleName: dbWork.circle_name,
    title: dbWork.title,
    genre: dbWork.genre,
    category: dbWork.category as WorkCategory | null,
    releaseDate: dbWork.release_date,
    dlsiteProductId: dbWork.dlsite_product_id,
    dlsiteUrl: dbWork.dlsite_url,
    fanzaUrl: dbWork.fanza_url,
    thumbnailUrl: dbWork.thumbnail_url,
    sampleImages: parseSampleImages(dbWork.sample_images),
    priceDlsite: dbWork.price_dlsite,
    priceFanza: dbWork.price_fanza,
    // プラットフォーム別セール情報
    discountRateDlsite: dbWork.discount_rate_dlsite,
    discountRateFanza: dbWork.discount_rate_fanza,
    saleEndDateDlsite: dbWork.sale_end_date_dlsite,
    saleEndDateFanza: dbWork.sale_end_date_fanza,
    // 集計値
    lowestPrice: dbWork.lowest_price,
    maxDiscountRate: dbWork.max_discount_rate,
    isOnSale: Boolean(dbWork.is_on_sale),
    // ランキング情報
    dlsiteRank: dbWork.dlsite_rank,
    fanzaRank: dbWork.fanza_rank,
    dlsiteRankDate: dbWork.dlsite_rank_date,
    fanzaRankDate: dbWork.fanza_rank_date,
    // AI生成データ
    aiSummary: dbWork.ai_summary,
    aiRecommendReason: dbWork.ai_recommend_reason,
    aiClickTitle: dbWork.ai_click_title,
    aiTags: dbWork.ai_tags || [],
    aiTargetAudience: dbWork.ai_target_audience,
    aiAppealPoints: dbWork.ai_appeal_points,
    aiWarnings: dbWork.ai_warnings,
    aiReview: dbWork.ai_review,
    actors: dbWork.cv_names || [],
    killerWords: {
      cvNames: dbWork.cv_names,
      durationMinutes: dbWork.duration_minutes,
      situations: dbWork.situations,
      fetishTags: dbWork.fetish_tags,
      cgCount: dbWork.cg_count,
      cgDiffCount: dbWork.cg_diff_count,
      hSceneCount: dbWork.h_scene_count,
      playTimeHours: dbWork.play_time_hours
        ? Number(dbWork.play_time_hours)
        : null,
      gameFeatures: dbWork.game_features,
    },
    // 評価・レビュー情報
    ratingDlsite: dbWork.rating_dlsite,
    ratingFanza: dbWork.rating_fanza,
    reviewCountDlsite: dbWork.review_count_dlsite,
    reviewCountFanza: dbWork.review_count_fanza,
    userReviews: parseUserReviews(dbWork.user_reviews),
  };
}

export function dbCircleToCircle(dbCircle: DbCircle): Circle {
  return {
    id: dbCircle.id,
    name: dbCircle.name,
    dlsiteId: dbCircle.dlsite_id,
    fanzaId: dbCircle.fanza_id,
    mainGenre: dbCircle.main_genre,
    workCount: dbCircle.work_count,
  };
}

export function dbActorToActor(dbActor: DbActor): Actor {
  return {
    name: dbActor.name,
    workCount: dbActor.work_count,
  };
}

export function dbTagToTag(dbTag: DbTag): Tag {
  return {
    name: dbTag.name,
    workCount: dbTag.work_count,
  };
}
