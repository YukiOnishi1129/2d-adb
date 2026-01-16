import { Pool } from "pg";

// ビルド時にのみ使用するDB接続
// DATABASE_URL環境変数から接続情報を取得
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // 接続プールの最大接続数を制限
});

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
  thumbnail_url: string | null;
  sample_images: string | null; // JSON文字列
  price_dlsite: number | null;
  price_fanza: number | null;
  // プラットフォーム別セール情報
  discount_rate_dlsite: number | null;
  discount_rate_fanza: number | null;
  sale_end_date_dlsite: string | null;
  sale_end_date_fanza: string | null;
  // 集計値（ソート用）
  lowest_price: number | null;
  max_discount_rate: number | null;
  is_on_sale: boolean;
  // ランキング情報
  dlsite_rank: number | null;
  fanza_rank: number | null;
  dlsite_rank_date: string | null;
  fanza_rank_date: string | null;
  // AI生成データ
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
  // 評価・レビュー情報
  rating_dlsite: number | null;
  rating_fanza: number | null;
  review_count_dlsite: number | null;
  review_count_fanza: number | null;
  user_reviews: string | null; // JSON文字列
}

export interface DbCircle {
  id: number;
  name: string;
  dlsite_id: string | null;
  fanza_id: string | null;
  main_genre: string | null;
  work_count: number;
}

export interface DbActor {
  name: string;
  work_count: number;
}

export interface DbTag {
  name: string;
  work_count: number;
}

// 共通のSELECTカラム（クエリの重複を減らすため）
const WORK_SELECT_COLUMNS = `
  w.id, w.circle_id, c.name as circle_name, w.title, w.genre, w.category,
  w.release_date::text, w.dlsite_product_id, w.dlsite_url, w.fanza_url,
  w.thumbnail_url, w.sample_images, w.price_dlsite, w.price_fanza,
  w.discount_rate_dlsite, w.discount_rate_fanza,
  w.sale_end_date_dlsite::text, w.sale_end_date_fanza::text,
  w.lowest_price, w.max_discount_rate, w.is_on_sale,
  w.dlsite_rank, w.fanza_rank, w.dlsite_rank_date::text, w.fanza_rank_date::text,
  w.ai_summary, w.ai_recommend_reason, w.ai_click_title, w.ai_tags,
  w.ai_target_audience, w.ai_appeal_points, w.ai_warnings, w.ai_review,
  w.cv_names, w.duration_minutes, w.situations, w.fetish_tags,
  w.cg_count, w.cg_diff_count, w.h_scene_count, w.play_time_hours, w.game_features,
  w.rating_dlsite, w.rating_fanza, w.review_count_dlsite, w.review_count_fanza, w.user_reviews
`;

// 新着作品を取得
export async function getNewWorks(limit = 20): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true
    ORDER BY w.release_date DESC NULLS LAST
    LIMIT $1
  `,
    [limit],
  );
  return result.rows;
}

// セール中の作品を取得（割引率順）
export async function getSaleWorks(limit = 20): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true AND w.is_on_sale = true
    ORDER BY w.max_discount_rate DESC NULLS LAST
    LIMIT $1
  `,
    [limit],
  );
  return result.rows;
}

// ジャンル別作品を取得
export async function getWorksByGenre(
  genre: string,
  limit = 20,
): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true AND w.genre ILIKE $1
    ORDER BY w.release_date DESC NULLS LAST
    LIMIT $2
  `,
    [`%${genre}%`, limit],
  );
  return result.rows;
}

// DLsiteランキング作品を取得
export async function getDlsiteRankingWorks(limit = 20): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true AND w.dlsite_rank IS NOT NULL
    ORDER BY w.dlsite_rank ASC
    LIMIT $1
  `,
    [limit],
  );
  return result.rows;
}

// FANZAランキング作品を取得
export async function getFanzaRankingWorks(limit = 20): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true AND w.fanza_rank IS NOT NULL
    ORDER BY w.fanza_rank ASC
    LIMIT $1
  `,
    [limit],
  );
  return result.rows;
}

// 爆安作品を取得（最安値で500円以下）
export async function getBargainWorks(
  maxPrice = 500,
  limit = 20,
): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true AND w.lowest_price <= $1
    ORDER BY w.lowest_price ASC NULLS LAST
    LIMIT $2
  `,
    [maxPrice, limit],
  );
  return result.rows;
}

// ボイス・ASMRランキング作品を取得
export async function getVoiceRankingWorks(limit = 20): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true
      AND w.genre = '音声'
      AND (w.dlsite_rank IS NOT NULL OR w.fanza_rank IS NOT NULL)
    ORDER BY
      COALESCE(w.dlsite_rank, 9999) + COALESCE(w.fanza_rank, 9999) ASC,
      w.release_date DESC NULLS LAST
    LIMIT $1
  `,
    [limit],
  );
  return result.rows;
}

// ゲームランキング作品を取得
export async function getGameRankingWorks(limit = 20): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true
      AND w.genre = 'ゲーム'
      AND (w.dlsite_rank IS NOT NULL OR w.fanza_rank IS NOT NULL)
    ORDER BY
      COALESCE(w.dlsite_rank, 9999) + COALESCE(w.fanza_rank, 9999) ASC,
      w.release_date DESC NULLS LAST
    LIMIT $1
  `,
    [limit],
  );
  return result.rows;
}

// 高評価作品を取得（4.5以上）
export async function getHighRatedWorks(minRating = 4.5, limit = 20): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true
      AND (w.rating_dlsite >= $1 OR w.rating_fanza >= $1)
    ORDER BY
      GREATEST(COALESCE(w.rating_dlsite, 0), COALESCE(w.rating_fanza, 0)) DESC,
      COALESCE(w.review_count_dlsite, 0) + COALESCE(w.review_count_fanza, 0) DESC,
      w.release_date DESC NULLS LAST
    LIMIT $2
  `,
    [minRating, limit],
  );
  return result.rows;
}

// 全作品を取得（検索インデックス用）
export async function getAllWorks(): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(`
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true
    ORDER BY w.release_date DESC NULLS LAST
  `);
  return result.rows;
}

// 作品詳細を取得
export async function getWorkById(id: number): Promise<DbWork | null> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.id = $1
  `,
    [id],
  );
  return result.rows[0] || null;
}

// RJコードで作品詳細を取得
export async function getWorkByRjCode(rjCode: string): Promise<DbWork | null> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.dlsite_product_id = $1
  `,
    [rjCode],
  );
  return result.rows[0] || null;
}

// サークル一覧を取得
export async function getCircles(): Promise<DbCircle[]> {
  const result = await pool.query<DbCircle>(`
    SELECT
      c.id, c.name, c.dlsite_id, c.fanza_id, c.main_genre,
      COUNT(w.id)::int as work_count
    FROM circles c
    LEFT JOIN works w ON c.id = w.circle_id AND w.is_available = true
    GROUP BY c.id
    ORDER BY work_count DESC
  `);
  return result.rows;
}

// サークル詳細と作品を取得
export async function getCircleWithWorks(
  circleName: string,
): Promise<{ circle: DbCircle | null; works: DbWork[] }> {
  const circleResult = await pool.query<DbCircle>(
    `
    SELECT
      c.id, c.name, c.dlsite_id, c.fanza_id, c.main_genre,
      COUNT(w.id)::int as work_count
    FROM circles c
    LEFT JOIN works w ON c.id = w.circle_id AND w.is_available = true
    WHERE c.name = $1
    GROUP BY c.id
  `,
    [circleName],
  );

  if (circleResult.rows.length === 0) {
    return { circle: null, works: [] };
  }

  const circle = circleResult.rows[0];
  const worksResult = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.circle_id = $1 AND w.is_available = true
    ORDER BY w.release_date DESC NULLS LAST
  `,
    [circle.id],
  );

  return { circle, works: worksResult.rows };
}

// 声優一覧を取得（cv_namesから集計）
export async function getActors(): Promise<DbActor[]> {
  const result = await pool.query<DbActor>(`
    SELECT
      unnest(cv_names) as name,
      COUNT(*)::int as work_count
    FROM works
    WHERE is_available = true AND cv_names IS NOT NULL
    GROUP BY name
    ORDER BY work_count DESC
  `);
  return result.rows;
}

// 声優別の作品を取得
export async function getWorksByActor(actorName: string): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true AND $1 = ANY(w.cv_names)
    ORDER BY w.release_date DESC NULLS LAST
  `,
    [actorName],
  );
  return result.rows;
}

// タグ一覧を取得（ai_tagsから集計）
export async function getTags(): Promise<DbTag[]> {
  const result = await pool.query<DbTag>(`
    SELECT
      unnest(ai_tags) as name,
      COUNT(*)::int as work_count
    FROM works
    WHERE is_available = true AND ai_tags IS NOT NULL
    GROUP BY name
    ORDER BY work_count DESC
  `);
  return result.rows;
}

// タグ別の作品を取得
export async function getWorksByTag(tagName: string): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true AND $1 = ANY(w.ai_tags)
    ORDER BY w.release_date DESC NULLS LAST
  `,
    [tagName],
  );
  return result.rows;
}

// 全作品IDを取得（generateStaticParams用）
export async function getAllWorkIds(): Promise<number[]> {
  const result = await pool.query<{ id: number }>(`
    SELECT id FROM works WHERE is_available = true
  `);
  return result.rows.map((r) => r.id);
}

// 全RJコードを取得（generateStaticParams用）
export async function getAllRjCodes(): Promise<string[]> {
  const result = await pool.query<{ dlsite_product_id: string }>(`
    SELECT dlsite_product_id FROM works
    WHERE is_available = true AND dlsite_product_id IS NOT NULL
  `);
  return result.rows.map((r) => r.dlsite_product_id);
}

// 全サークル名を取得（generateStaticParams用）
export async function getAllCircleNames(): Promise<string[]> {
  const result = await pool.query<{ name: string }>(`
    SELECT DISTINCT c.name FROM circles c
    INNER JOIN works w ON c.id = w.circle_id AND w.is_available = true
  `);
  return result.rows.map((r) => r.name);
}

// 全声優名を取得（generateStaticParams用）
export async function getAllActorNames(): Promise<string[]> {
  const result = await pool.query<{ name: string }>(`
    SELECT DISTINCT unnest(cv_names) as name
    FROM works
    WHERE is_available = true AND cv_names IS NOT NULL
  `);
  return result.rows.map((r) => r.name);
}

// 全タグ名を取得（generateStaticParams用）
export async function getAllTagNames(): Promise<string[]> {
  const result = await pool.query<{ name: string }>(`
    SELECT DISTINCT unnest(ai_tags) as name
    FROM works
    WHERE is_available = true AND ai_tags IS NOT NULL
  `);
  return result.rows.map((r) => r.name);
}

// セール特集データの型定義
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

// 最新のセール特集データを取得
export async function getLatestSaleFeature(): Promise<DbSaleFeature | null> {
  const result = await pool.query<DbSaleFeature>(`
    SELECT
      id, target_date::text, main_work_id, main_headline, main_reason, main_category,
      sub1_work_id, sub1_one_liner, sub1_category,
      sub2_work_id, sub2_one_liner, sub2_category,
      cheapest_work_ids, high_discount_work_ids, high_rating_work_ids,
      total_sale_count, dlsite_count, fanza_count, max_discount_rate, ogp_image_url
    FROM sale_features
    ORDER BY target_date DESC
    LIMIT 1
  `);
  return result.rows[0] || null;
}

// 複数のwork_idから作品を取得
export async function getWorksByIds(ids: number[]): Promise<DbWork[]> {
  if (ids.length === 0) return [];

  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.id = ANY($1) AND w.is_available = true
  `,
    [ids],
  );

  // IDの順序を維持
  const workMap = new Map(result.rows.map((w) => [w.id, w]));
  return ids.map((id) => workMap.get(id)).filter((w): w is DbWork => w !== undefined);
}

// 今日のおすすめデータの型定義
export interface DbDailyRecommendation {
  id: number;
  target_date: string;
  headline: string | null;
  asmr_works: { work_id: number; reason: string; target_audience: string }[] | null;
  game_works: { work_id: number; reason: string; target_audience: string }[] | null;
  total_works_count: number;
  asmr_count: number;
  game_count: number;
}

// 最新の今日のおすすめデータを取得
export async function getLatestDailyRecommendation(): Promise<DbDailyRecommendation | null> {
  const result = await pool.query<DbDailyRecommendation>(`
    SELECT
      id, target_date::text, headline,
      asmr_works, game_works,
      total_works_count, asmr_count, game_count
    FROM daily_recommendations
    ORDER BY target_date DESC
    LIMIT 1
  `);
  return result.rows[0] || null;
}

// 関連作品を取得（上2件:声優、下2件:タグ/サークル/カテゴリでバリエーション）
export async function getRelatedWorks(
  workId: number,
  limit = 4,
): Promise<DbWork[]> {
  // まず対象作品の情報を取得
  const targetWork = await getWorkById(workId);
  if (!targetWork) return [];

  const relatedIds = new Set<number>();
  const cvWorks: DbWork[] = [];
  const otherWorks: DbWork[] = [];
  const halfLimit = Math.floor(limit / 2);

  // 1. 同じ声優の作品（上半分用: 2件）
  if (targetWork.cv_names && targetWork.cv_names.length > 0) {
    const cvResult = await pool.query<DbWork>(
      `
      SELECT ${WORK_SELECT_COLUMNS}
      FROM works w
      LEFT JOIN circles c ON w.circle_id = c.id
      WHERE w.is_available = true
        AND w.id != $1
        AND w.cv_names && $2
      ORDER BY w.release_date DESC NULLS LAST
      LIMIT $3
    `,
      [workId, targetWork.cv_names, halfLimit],
    );
    for (const work of cvResult.rows) {
      relatedIds.add(work.id);
      cvWorks.push(work);
    }
  }

  // 2. 同じタグの作品（下半分用: 2件）
  if (targetWork.ai_tags && targetWork.ai_tags.length > 0) {
    const tagResult = await pool.query<DbWork>(
      `
      SELECT ${WORK_SELECT_COLUMNS}
      FROM works w
      LEFT JOIN circles c ON w.circle_id = c.id
      WHERE w.is_available = true
        AND w.id != $1
        AND w.ai_tags && $2
      ORDER BY
        array_length(ARRAY(SELECT unnest(w.ai_tags) INTERSECT SELECT unnest($2::text[])), 1) DESC NULLS LAST,
        w.release_date DESC NULLS LAST
      LIMIT $3
    `,
      [workId, targetWork.ai_tags, halfLimit * 2],
    );
    for (const work of tagResult.rows) {
      if (!relatedIds.has(work.id) && otherWorks.length < halfLimit) {
        relatedIds.add(work.id);
        otherWorks.push(work);
      }
    }
  }

  // 3. 同じサークルの作品（タグで足りない場合）
  if (otherWorks.length < halfLimit && targetWork.circle_id) {
    const circleResult = await pool.query<DbWork>(
      `
      SELECT ${WORK_SELECT_COLUMNS}
      FROM works w
      LEFT JOIN circles c ON w.circle_id = c.id
      WHERE w.is_available = true
        AND w.id != $1
        AND w.circle_id = $2
      ORDER BY w.release_date DESC NULLS LAST
      LIMIT $3
    `,
      [workId, targetWork.circle_id, halfLimit],
    );
    for (const work of circleResult.rows) {
      if (!relatedIds.has(work.id) && otherWorks.length < halfLimit) {
        relatedIds.add(work.id);
        otherWorks.push(work);
      }
    }
  }

  // 4. 同じカテゴリの作品（フォールバック）
  if (otherWorks.length < halfLimit && targetWork.category) {
    const categoryResult = await pool.query<DbWork>(
      `
      SELECT ${WORK_SELECT_COLUMNS}
      FROM works w
      LEFT JOIN circles c ON w.circle_id = c.id
      WHERE w.is_available = true
        AND w.id != $1
        AND w.category = $2
      ORDER BY w.release_date DESC NULLS LAST
      LIMIT $3
    `,
      [workId, targetWork.category, halfLimit],
    );
    for (const work of categoryResult.rows) {
      if (!relatedIds.has(work.id) && otherWorks.length < halfLimit) {
        relatedIds.add(work.id);
        otherWorks.push(work);
      }
    }
  }

  // 声優作品が足りない場合はotherWorksで補完
  const results = [...cvWorks];
  for (const work of otherWorks) {
    if (results.length < limit) {
      results.push(work);
    }
  }

  // まだ足りない場合はカテゴリから追加で取得
  if (results.length < limit && targetWork.category) {
    const fillResult = await pool.query<DbWork>(
      `
      SELECT ${WORK_SELECT_COLUMNS}
      FROM works w
      LEFT JOIN circles c ON w.circle_id = c.id
      WHERE w.is_available = true
        AND w.id != $1
        AND w.category = $2
      ORDER BY w.release_date DESC NULLS LAST
      LIMIT $3
    `,
      [workId, targetWork.category, limit],
    );
    for (const work of fillResult.rows) {
      if (!relatedIds.has(work.id) && results.length < limit) {
        relatedIds.add(work.id);
        results.push(work);
      }
    }
  }

  return results;
}

// 同じサークルの人気作品を取得（自分以外、評価順）
export async function getPopularWorksByCircle(
  circleId: number,
  excludeWorkId: number,
  limit: number = 4,
): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true
      AND w.circle_id = $1
      AND w.id != $2
    ORDER BY
      COALESCE(w.rating_dlsite, w.rating_fanza, 0) DESC,
      w.release_date DESC NULLS LAST
    LIMIT $3
  `,
    [circleId, excludeWorkId, limit],
  );
  return result.rows;
}

// 同じCVの人気作品を取得（自分以外、評価順）
export async function getPopularWorksByActor(
  actorName: string,
  excludeWorkId: number,
  limit: number = 4,
): Promise<DbWork[]> {
  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true
      AND $1 = ANY(w.cv_names)
      AND w.id != $2
    ORDER BY
      COALESCE(w.rating_dlsite, w.rating_fanza, 0) DESC,
      w.release_date DESC NULLS LAST
    LIMIT $3
  `,
    [actorName, excludeWorkId, limit],
  );
  return result.rows;
}

// タグベースで「この作品を買った人はこれも」を取得
export async function getSimilarWorksByTags(
  workId: number,
  tags: string[],
  limit: number = 4,
): Promise<DbWork[]> {
  if (!tags || tags.length === 0) return [];

  const result = await pool.query<DbWork>(
    `
    SELECT ${WORK_SELECT_COLUMNS}
    FROM works w
    LEFT JOIN circles c ON w.circle_id = c.id
    WHERE w.is_available = true
      AND w.id != $1
      AND w.ai_tags && $2
    ORDER BY
      array_length(ARRAY(SELECT unnest(w.ai_tags) INTERSECT SELECT unnest($2::text[])), 1) DESC NULLS LAST,
      COALESCE(w.rating_dlsite, w.rating_fanza, 0) DESC,
      w.release_date DESC NULLS LAST
    LIMIT $3
  `,
    [workId, tags, limit],
  );
  return result.rows;
}

// 特集ページデータの型定義
export interface DbFeatureRecommendation {
  id: number;
  slug: string;
  name: string;
  headline: string | null;
  description: string | null;
  asmr_works: { work_id: number; reason: string; target_audience: string; thumbnail_url?: string }[] | null;
  game_works: { work_id: number; reason: string; target_audience: string; thumbnail_url?: string }[] | null;
  thumbnail_url: string | null;
  asmr_count: number;
  game_count: number;
  updated_at: string;
}

// 特集ページデータをslugで取得
export async function getFeatureBySlug(slug: string): Promise<DbFeatureRecommendation | null> {
  const result = await pool.query<DbFeatureRecommendation>(`
    SELECT
      id, slug, name, headline, description,
      asmr_works, game_works, thumbnail_url,
      asmr_count, game_count, updated_at::text
    FROM feature_recommendations
    WHERE slug = $1
  `, [slug]);
  return result.rows[0] || null;
}

// 全特集ページデータを取得
export async function getAllFeatures(): Promise<DbFeatureRecommendation[]> {
  const result = await pool.query<DbFeatureRecommendation>(`
    SELECT
      id, slug, name, headline, description,
      asmr_works, game_works, thumbnail_url,
      asmr_count, game_count, updated_at::text
    FROM feature_recommendations
    ORDER BY slug
  `);
  return result.rows;
}

// 全特集slugを取得（generateStaticParams用）
export async function getAllFeatureSlugs(): Promise<string[]> {
  const result = await pool.query<{ slug: string }>(`
    SELECT slug FROM feature_recommendations
  `);
  return result.rows.map((r) => r.slug);
}

// DB接続を閉じる
export async function closeDb(): Promise<void> {
  await pool.end();
}
