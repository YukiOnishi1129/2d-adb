/**
 * データベースアクセス層
 *
 * R2のParquetファイルからデータを取得する。
 * ビルド時に一度だけダウンロードしてメモリ内でクエリを実行する。
 */

import {
  getWorks,
  getCirclesData,
  getVoiceActorFeaturesData,
  getFeatureRecommendationsData,
  getDailyRecommendationsData,
  getSaleFeaturesData,
  type DbWork as ParquetDbWork,
  type DbCircle as ParquetDbCircle,
  type DbVoiceActorFeature as ParquetDbVoiceActorFeature,
  type DbFeatureRecommendation as ParquetDbFeatureRecommendation,
  type DbDailyRecommendation as ParquetDbDailyRecommendation,
  type DbSaleFeature as ParquetDbSaleFeature,
} from "./parquet-loader";

// 型のエクスポート（互換性維持）
export type DbWork = ParquetDbWork;
export type DbCircle = ParquetDbCircle;
export type DbVoiceActorFeature = ParquetDbVoiceActorFeature;
export type DbFeatureRecommendation = ParquetDbFeatureRecommendation;
export type DbDailyRecommendation = ParquetDbDailyRecommendation;
export type DbSaleFeature = ParquetDbSaleFeature;

export interface DbActor {
  name: string;
  work_count: number;
}

export interface DbTag {
  name: string;
  work_count: number;
}

// サークル名でcircle_nameを付与するヘルパー
async function enrichWorksWithCircleName(works: DbWork[]): Promise<DbWork[]> {
  const circles = await getCirclesData();
  const circleMap = new Map(circles.map((c) => [c.id, c.name]));

  return works.map((w) => ({
    ...w,
    circle_name: w.circle_id ? circleMap.get(w.circle_id) || null : null,
  }));
}

// 利用可能な作品のみフィルタ
function filterAvailable(works: DbWork[]): DbWork[] {
  return works.filter((w) => w.is_available !== false);
}

// 新着作品を取得
export async function getNewWorks(limit = 20): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works);
  const sorted = available.sort((a, b) => {
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateB.localeCompare(dateA);
  });
  return enrichWorksWithCircleName(sorted.slice(0, limit));
}

// セール中の作品を取得（割引率順）
export async function getSaleWorks(limit = 20): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter((w) => w.is_on_sale);
  const sorted = available.sort((a, b) => {
    const rateA = a.max_discount_rate || 0;
    const rateB = b.max_discount_rate || 0;
    return rateB - rateA;
  });
  return enrichWorksWithCircleName(sorted.slice(0, limit));
}

// ジャンル別作品を取得
export async function getWorksByGenre(
  genre: string,
  limit = 20,
): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) => w.genre?.toLowerCase().includes(genre.toLowerCase()),
  );
  const sorted = available.sort((a, b) => {
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateB.localeCompare(dateA);
  });
  return enrichWorksWithCircleName(sorted.slice(0, limit));
}

// DLsiteランキング作品を取得
export async function getDlsiteRankingWorks(limit = 20): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) => w.dlsite_rank !== null,
  );
  const sorted = available.sort((a, b) => {
    return (a.dlsite_rank || 9999) - (b.dlsite_rank || 9999);
  });
  return enrichWorksWithCircleName(sorted.slice(0, limit));
}

// FANZAランキング作品を取得（音声・ゲームのみ）
export async function getFanzaRankingWorks(limit = 20): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) =>
      w.fanza_rank !== null &&
      w.genre &&
      (w.genre.includes("音声") || w.genre.includes("ゲーム")),
  );
  const sorted = available.sort((a, b) => {
    return (a.fanza_rank || 9999) - (b.fanza_rank || 9999);
  });
  return enrichWorksWithCircleName(sorted.slice(0, limit));
}

// 爆安作品を取得（最安値で500円以下）
export async function getBargainWorks(
  maxPrice = 500,
  limit = 20,
): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) => w.lowest_price !== null && w.lowest_price <= maxPrice,
  );
  const sorted = available.sort((a, b) => {
    return (a.lowest_price || 0) - (b.lowest_price || 0);
  });
  return enrichWorksWithCircleName(sorted.slice(0, limit));
}

// ボイス・ASMRランキング作品を取得
export async function getVoiceRankingWorks(limit = 20): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) =>
      w.category === "ASMR" &&
      (w.dlsite_rank !== null || w.fanza_rank !== null),
  );
  const sorted = available.sort((a, b) => {
    const rankA =
      (a.dlsite_rank || 9999) + (a.fanza_rank || 9999);
    const rankB =
      (b.dlsite_rank || 9999) + (b.fanza_rank || 9999);
    if (rankA !== rankB) return rankA - rankB;
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateB.localeCompare(dateA);
  });
  return enrichWorksWithCircleName(sorted.slice(0, limit));
}

// ゲームランキング作品を取得
export async function getGameRankingWorks(limit = 20): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) =>
      w.category === "ゲーム" &&
      (w.dlsite_rank !== null || w.fanza_rank !== null),
  );
  const sorted = available.sort((a, b) => {
    const rankA =
      (a.dlsite_rank || 9999) + (a.fanza_rank || 9999);
    const rankB =
      (b.dlsite_rank || 9999) + (b.fanza_rank || 9999);
    if (rankA !== rankB) return rankA - rankB;
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateB.localeCompare(dateA);
  });
  return enrichWorksWithCircleName(sorted.slice(0, limit));
}

// 高評価作品を取得（4.5以上）
export async function getHighRatedWorks(
  minRating = 4.5,
  limit = 20,
): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) =>
      (w.rating_dlsite !== null && w.rating_dlsite >= minRating) ||
      (w.rating_fanza !== null && w.rating_fanza >= minRating),
  );
  const sorted = available.sort((a, b) => {
    const ratingA = Math.max(a.rating_dlsite || 0, a.rating_fanza || 0);
    const ratingB = Math.max(b.rating_dlsite || 0, b.rating_fanza || 0);
    if (ratingA !== ratingB) return ratingB - ratingA;
    const reviewsA = (a.review_count_dlsite || 0) + (a.review_count_fanza || 0);
    const reviewsB = (b.review_count_dlsite || 0) + (b.review_count_fanza || 0);
    if (reviewsA !== reviewsB) return reviewsB - reviewsA;
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateB.localeCompare(dateA);
  });
  return enrichWorksWithCircleName(sorted.slice(0, limit));
}

// 全作品を取得（検索インデックス用）
export async function getAllWorks(): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works);
  const sorted = available.sort((a, b) => {
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateB.localeCompare(dateA);
  });
  return enrichWorksWithCircleName(sorted);
}

// 作品詳細を取得
export async function getWorkById(id: number): Promise<DbWork | null> {
  const works = await getWorks();
  const work = works.find((w) => w.id === id);
  if (!work) return null;
  const enriched = await enrichWorksWithCircleName([work]);
  return enriched[0] || null;
}

// RJコードで作品詳細を取得
export async function getWorkByRjCode(rjCode: string): Promise<DbWork | null> {
  const works = await getWorks();
  const work = works.find((w) => w.dlsite_product_id === rjCode);
  if (!work) return null;
  const enriched = await enrichWorksWithCircleName([work]);
  return enriched[0] || null;
}

// サークル一覧を取得
export async function getCircles(): Promise<DbCircle[]> {
  const circles = await getCirclesData();
  const works = await getWorks();
  const available = filterAvailable(works);

  // work_countを計算
  const circleWorkCounts = new Map<number, number>();
  for (const work of available) {
    if (work.circle_id) {
      circleWorkCounts.set(
        work.circle_id,
        (circleWorkCounts.get(work.circle_id) || 0) + 1,
      );
    }
  }

  return circles
    .map((c) => ({
      ...c,
      work_count: circleWorkCounts.get(c.id) || 0,
    }))
    .sort((a, b) => b.work_count - a.work_count);
}

// サークル詳細と作品を取得
export async function getCircleWithWorks(
  circleName: string,
): Promise<{ circle: DbCircle | null; works: DbWork[] }> {
  const circles = await getCirclesData();
  const circle = circles.find((c) => c.name === circleName);

  if (!circle) {
    return { circle: null, works: [] };
  }

  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) => w.circle_id === circle.id,
  );
  const sorted = available.sort((a, b) => {
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateB.localeCompare(dateA);
  });

  const enrichedWorks = await enrichWorksWithCircleName(sorted);

  return {
    circle: {
      ...circle,
      work_count: enrichedWorks.length,
    },
    works: enrichedWorks,
  };
}

// 声優一覧を取得（cv_namesから集計）
export async function getActors(): Promise<DbActor[]> {
  const works = await getWorks();
  const available = filterAvailable(works);
  const actorCounts = new Map<string, number>();

  for (const work of available) {
    if (work.cv_names) {
      for (const name of work.cv_names) {
        actorCounts.set(name, (actorCounts.get(name) || 0) + 1);
      }
    }
  }

  return Array.from(actorCounts.entries())
    .map(([name, work_count]) => ({ name, work_count }))
    .sort((a, b) => b.work_count - a.work_count);
}

// 声優別の作品を取得
export async function getWorksByActor(actorName: string): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) => w.cv_names?.includes(actorName),
  );
  const sorted = available.sort((a, b) => {
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateB.localeCompare(dateA);
  });
  return enrichWorksWithCircleName(sorted);
}

// タグ一覧を取得（ai_tagsから集計）
export async function getTags(): Promise<DbTag[]> {
  const works = await getWorks();
  const available = filterAvailable(works);
  const tagCounts = new Map<string, number>();

  for (const work of available) {
    if (work.ai_tags) {
      for (const tag of work.ai_tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  return Array.from(tagCounts.entries())
    .map(([name, work_count]) => ({ name, work_count }))
    .sort((a, b) => b.work_count - a.work_count);
}

// タグ別の作品を取得
export async function getWorksByTag(tagName: string): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) => w.ai_tags?.includes(tagName),
  );
  const sorted = available.sort((a, b) => {
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateB.localeCompare(dateA);
  });
  return enrichWorksWithCircleName(sorted);
}

// 全作品IDを取得（generateStaticParams用）
export async function getAllWorkIds(): Promise<number[]> {
  const works = await getWorks();
  return filterAvailable(works).map((w) => w.id);
}

// 全RJコードを取得（generateStaticParams用）
export async function getAllRjCodes(): Promise<string[]> {
  const works = await getWorks();
  return filterAvailable(works)
    .filter((w) => w.dlsite_product_id)
    .map((w) => w.dlsite_product_id as string);
}

// 全サークル名を取得（generateStaticParams用）
export async function getAllCircleNames(): Promise<string[]> {
  const circles = await getCirclesData();
  const works = await getWorks();
  const available = filterAvailable(works);
  const circleIdsWithWorks = new Set(
    available.map((w) => w.circle_id).filter((id) => id !== null),
  );
  return circles
    .filter((c) => circleIdsWithWorks.has(c.id))
    .map((c) => c.name);
}

// 全声優名を取得（generateStaticParams用）
export async function getAllActorNames(): Promise<string[]> {
  const works = await getWorks();
  const available = filterAvailable(works);
  const actorNames = new Set<string>();
  for (const work of available) {
    if (work.cv_names) {
      for (const name of work.cv_names) {
        actorNames.add(name);
      }
    }
  }
  return Array.from(actorNames);
}

// 全タグ名を取得（generateStaticParams用）
export async function getAllTagNames(): Promise<string[]> {
  const works = await getWorks();
  const available = filterAvailable(works);
  const tagNames = new Set<string>();
  for (const work of available) {
    if (work.ai_tags) {
      for (const tag of work.ai_tags) {
        tagNames.add(tag);
      }
    }
  }
  return Array.from(tagNames);
}

// 最新のセール特集データを取得
export async function getLatestSaleFeature(): Promise<DbSaleFeature | null> {
  const features = await getSaleFeaturesData();
  if (features.length === 0) return null;
  const sorted = features.sort((a, b) =>
    b.target_date.localeCompare(a.target_date),
  );
  return sorted[0] || null;
}

// 複数のwork_idから作品を取得
export async function getWorksByIds(ids: number[]): Promise<DbWork[]> {
  if (ids.length === 0) return [];
  const works = await getWorks();
  const available = filterAvailable(works);
  const workMap = new Map(available.map((w) => [w.id, w]));
  const result = ids
    .map((id) => workMap.get(id))
    .filter((w): w is DbWork => w !== undefined);
  return enrichWorksWithCircleName(result);
}

// 最新の今日のおすすめデータを取得
export async function getLatestDailyRecommendation(): Promise<DbDailyRecommendation | null> {
  const recommendations = await getDailyRecommendationsData();
  if (recommendations.length === 0) return null;
  const sorted = recommendations.sort((a, b) =>
    b.target_date.localeCompare(a.target_date),
  );
  return sorted[0] || null;
}

// 関連作品を取得（上2件:声優、下2件:タグ/サークル/カテゴリでバリエーション）
export async function getRelatedWorks(
  workId: number,
  limit = 4,
): Promise<DbWork[]> {
  const targetWork = await getWorkById(workId);
  if (!targetWork) return [];

  const works = await getWorks();
  const available = filterAvailable(works).filter((w) => w.id !== workId);
  const relatedIds = new Set<number>();
  const cvWorks: DbWork[] = [];
  const otherWorks: DbWork[] = [];
  const halfLimit = Math.floor(limit / 2);

  // 1. 同じ声優の作品
  if (targetWork.cv_names && targetWork.cv_names.length > 0) {
    const cvNames = new Set(targetWork.cv_names);
    const matches = available
      .filter((w) => w.cv_names?.some((n) => cvNames.has(n)))
      .sort((a, b) => {
        const dateA = a.release_date || "";
        const dateB = b.release_date || "";
        return dateB.localeCompare(dateA);
      });
    for (const work of matches) {
      if (cvWorks.length < halfLimit && !relatedIds.has(work.id)) {
        relatedIds.add(work.id);
        cvWorks.push(work);
      }
    }
  }

  // 2. 同じタグの作品
  if (targetWork.ai_tags && targetWork.ai_tags.length > 0) {
    const tags = new Set(targetWork.ai_tags);
    const matches = available
      .filter((w) => w.ai_tags?.some((t) => tags.has(t)))
      .map((w) => ({
        work: w,
        matchCount: w.ai_tags
          ? w.ai_tags.filter((t) => tags.has(t)).length
          : 0,
      }))
      .sort((a, b) => {
        if (a.matchCount !== b.matchCount) return b.matchCount - a.matchCount;
        const dateA = a.work.release_date || "";
        const dateB = b.work.release_date || "";
        return dateB.localeCompare(dateA);
      });
    for (const { work } of matches) {
      if (otherWorks.length < halfLimit && !relatedIds.has(work.id)) {
        relatedIds.add(work.id);
        otherWorks.push(work);
      }
    }
  }

  // 3. 同じサークルの作品
  if (otherWorks.length < halfLimit && targetWork.circle_id) {
    const matches = available
      .filter((w) => w.circle_id === targetWork.circle_id)
      .sort((a, b) => {
        const dateA = a.release_date || "";
        const dateB = b.release_date || "";
        return dateB.localeCompare(dateA);
      });
    for (const work of matches) {
      if (otherWorks.length < halfLimit && !relatedIds.has(work.id)) {
        relatedIds.add(work.id);
        otherWorks.push(work);
      }
    }
  }

  // 4. 同じカテゴリの作品
  if (otherWorks.length < halfLimit && targetWork.category) {
    const matches = available
      .filter((w) => w.category === targetWork.category)
      .sort((a, b) => {
        const dateA = a.release_date || "";
        const dateB = b.release_date || "";
        return dateB.localeCompare(dateA);
      });
    for (const work of matches) {
      if (otherWorks.length < halfLimit && !relatedIds.has(work.id)) {
        relatedIds.add(work.id);
        otherWorks.push(work);
      }
    }
  }

  const results = [...cvWorks, ...otherWorks].slice(0, limit);
  return enrichWorksWithCircleName(results);
}

// 同じサークルの人気作品を取得
export async function getPopularWorksByCircle(
  circleId: number,
  excludeWorkId: number,
  limit = 4,
): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) => w.circle_id === circleId && w.id !== excludeWorkId,
  );
  const sorted = available.sort((a, b) => {
    const ratingA = a.rating_dlsite || a.rating_fanza || 0;
    const ratingB = b.rating_dlsite || b.rating_fanza || 0;
    if (ratingA !== ratingB) return ratingB - ratingA;
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateB.localeCompare(dateA);
  });
  return enrichWorksWithCircleName(sorted.slice(0, limit));
}

// 同じCVの人気作品を取得
export async function getPopularWorksByActor(
  actorName: string,
  excludeWorkId: number,
  limit = 4,
): Promise<DbWork[]> {
  const works = await getWorks();
  const available = filterAvailable(works).filter(
    (w) => w.id !== excludeWorkId && w.cv_names && w.cv_names.includes(actorName),
  );
  const sorted = available.sort((a, b) => {
    const ratingA = a.rating_dlsite || a.rating_fanza || 0;
    const ratingB = b.rating_dlsite || b.rating_fanza || 0;
    if (ratingA !== ratingB) return ratingB - ratingA;
    const dateA = a.release_date || "";
    const dateB = b.release_date || "";
    return dateB.localeCompare(dateA);
  });
  return enrichWorksWithCircleName(sorted.slice(0, limit));
}

// タグベースで「この作品を買った人はこれも」を取得
export async function getSimilarWorksByTags(
  workId: number,
  tags: string[],
  limit = 4,
): Promise<DbWork[]> {
  if (!tags || tags.length === 0) return [];
  const tagSet = new Set(tags);

  const works = await getWorks();
  const available = filterAvailable(works).filter((w) => w.id !== workId);
  const matches = available
    .filter((w) => w.ai_tags?.some((t) => tagSet.has(t)))
    .map((w) => ({
      work: w,
      matchCount: w.ai_tags ? w.ai_tags.filter((t) => tagSet.has(t)).length : 0,
    }))
    .sort((a, b) => {
      if (a.matchCount !== b.matchCount) return b.matchCount - a.matchCount;
      const ratingA = a.work.rating_dlsite || a.work.rating_fanza || 0;
      const ratingB = b.work.rating_dlsite || b.work.rating_fanza || 0;
      if (ratingA !== ratingB) return ratingB - ratingA;
      const dateA = a.work.release_date || "";
      const dateB = b.work.release_date || "";
      return dateB.localeCompare(dateA);
    });

  const result = matches.slice(0, limit).map((m) => m.work);
  return enrichWorksWithCircleName(result);
}

// 特集ページデータをslugで取得
export async function getFeatureBySlug(
  slug: string,
): Promise<DbFeatureRecommendation | null> {
  const features = await getFeatureRecommendationsData();
  return features.find((f) => f.slug === slug) || null;
}

// 全特集ページデータを取得
export async function getAllFeatures(): Promise<DbFeatureRecommendation[]> {
  const features = await getFeatureRecommendationsData();
  return features.sort((a, b) => a.slug.localeCompare(b.slug));
}

// 全特集slugを取得（generateStaticParams用）
export async function getAllFeatureSlugs(): Promise<string[]> {
  const features = await getFeatureRecommendationsData();
  return features.map((f) => f.slug);
}

// 特集ページデータを名前で取得（タグページからの導線用）
export async function getFeatureByName(
  name: string,
): Promise<DbFeatureRecommendation | null> {
  const features = await getFeatureRecommendationsData();
  return features.find((f) => f.name === name) || null;
}

// 声優特集データを名前で取得
export async function getVoiceActorFeatureByName(
  name: string,
): Promise<DbVoiceActorFeature | null> {
  const features = await getVoiceActorFeaturesData();
  return features.find((f) => f.name === name && f.is_active) || null;
}

// 声優特集データをslugで取得
export async function getVoiceActorFeatureBySlug(
  slug: string,
): Promise<DbVoiceActorFeature | null> {
  const features = await getVoiceActorFeaturesData();
  return features.find((f) => f.slug === slug && f.is_active) || null;
}

// 全声優特集データを取得
export async function getAllVoiceActorFeatures(): Promise<
  DbVoiceActorFeature[]
> {
  const features = await getVoiceActorFeaturesData();
  return features
    .filter((f) => f.is_active)
    .sort((a, b) => b.total_work_count - a.total_work_count);
}

// 全声優特集名を取得（generateStaticParams用）
export async function getAllVoiceActorFeatureNames(): Promise<string[]> {
  const features = await getVoiceActorFeaturesData();
  return features.filter((f) => f.is_active).map((f) => f.name);
}

// DB接続を閉じる（互換性のためのスタブ）
export async function closeDb(): Promise<void> {
  // Parquetベースなので何もしない
}
