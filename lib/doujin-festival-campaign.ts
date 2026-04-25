// FANZA同人「春の同人祭」キャンペーン
// 詳細: 人気作品50%OFF、ゲーム300円キャンペーン、同人祭限定クーポン等の総合キャンペーン
// 期間: 2026/04/16 12:00 〜 2026/05/18 11:59

const FANZA_AFFILIATE_ID = "monodata-990";

// FANZA同人祭の特集ページ
const DOUJIN_FESTIVAL_LANDING_URL =
  "https://www.dmm.co.jp/dc/doujin/feature/season_sale/index_html/=/ch_navi=none/";

// キャンペーン終了日時（JST 2026/05/18 11:59:59 まで有効）
export const CAMPAIGN_END_ISO = "2026-05-18T11:59:59+09:00";
const CAMPAIGN_END = new Date(CAMPAIGN_END_ISO);

// キャンペーン全体が現時点で有効か
export function isDoujinFestivalActive(now: Date = new Date()): boolean {
  return now.getTime() <= CAMPAIGN_END.getTime();
}

// アフィリエイトリダイレクト経由のキャンペーン誘導URL
// ch=toolbar&ch_id=link は DMM公式ツールバーの正規フォーマット
export function getDoujinFestivalAffiliateUrl(): string {
  return `https://al.fanza.co.jp/?lurl=${encodeURIComponent(DOUJIN_FESTIVAL_LANDING_URL)}&af_id=${FANZA_AFFILIATE_ID}&ch=toolbar&ch_id=link`;
}
