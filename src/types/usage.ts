/** ホーム画面の棒グラフで使用する1日分の通信量 */
export type DailyUsage = {
  date: string;
  day: string;
  amountGb: number;
};

/** ホーム画面に表示する今月の通信量と予測値 */
export type UsageSummary = {
  period: string;
  usedGb: number;
  limitGb: number;
  todayMb: number;
  dailyAverageMb: number;
  forecastGb: number;
  updatedAt: string;
};

export type UsageSnapshot = {
  summary: UsageSummary;
  recentUsage: DailyUsage[];
};

/** 通信量Providerの取得状態 */
export type UsageStatus =
  | 'idle'
  | 'loading'
  | 'permissionRequired'
  | 'ready'
  | 'error'
  | 'unsupported';

export type UsageHistoryRange = 'daily' | 'weekly' | 'monthly';

/** 履歴グラフと一覧に表示する1期間分の通信量 */
export type UsageHistoryEntry = {
  amountGb: number;
  chartLabel: string;
  detail: string;
  id: string;
  label: string;
};

/** 選択中の履歴範囲について、合計・比較・内訳をまとめた表示データ */
export type UsageHistorySnapshot = {
  comparisonLabel: string;
  comparisonPercent: number | null;
  entries: UsageHistoryEntry[];
  listTitle: string;
  summaryLabel: string;
  totalGb: number;
};
