import {Platform} from 'react-native';
import {networkUsageNative} from '../native/NetworkUsage';
import type {
  DailyUsage,
  UsageHistoryEntry,
  UsageHistoryRange,
  UsageHistorySnapshot,
  UsageSnapshot,
} from '../types/usage';

const BYTES_PER_GB = 1_000_000_000;
const BYTES_PER_MB = 1_000_000;
const DEFAULT_LIMIT_GB = 20;
const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function startOfWeek(date: Date): Date {
  const dayFromMonday = (date.getDay() + 6) % 7;
  return addDays(startOfDay(date), -dayFromMonday);
}

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatPeriod(start: Date, endExclusive: Date): string {
  const end = addDays(endExclusive, -1);
  return `${start.getMonth() + 1}月${start.getDate()}日〜${
    end.getMonth() + 1
  }月${end.getDate()}日`;
}

function createPeriod(now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {start, end};
}

function createRecentRanges(now: Date) {
  const today = startOfDay(now);

  return Array.from({length: 7}, (_, index) => {
    const start = addDays(today, index - 6);
    const naturalEnd = addDays(start, 1);
    const end = naturalEnd.getTime() > now.getTime() ? now : naturalEnd;
    return {start, end};
  });
}

type UsagePeriod = {
  chartLabel: string;
  detail: string;
  end: Date;
  id: string;
  label: string;
  start: Date;
};

export type UsageHistoryDefinition = {
  comparisonEnd: Date;
  comparisonLabel: string;
  comparisonStart: Date;
  listTitle: string;
  periods: UsagePeriod[];
  summaryEnd: Date;
  summaryLabel: string;
  summaryStart: Date;
};

function formatMonthDay(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function createDailyHistoryDefinition(now: Date): UsageHistoryDefinition {
  const today = startOfDay(now);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periods = Array.from({length: today.getDate()}, (_, index) => {
    const start = addDays(currentMonthStart, index);
    const naturalEnd = addDays(start, 1);

    return {
      chartLabel: `${start.getDate()}`,
      detail: `${DAY_NAMES[start.getDay()]}曜日`,
      end: naturalEnd.getTime() > now.getTime() ? now : naturalEnd,
      id: start.toISOString(),
      label: formatMonthDay(start),
      start,
    };
  });
  const elapsed = now.getTime() - currentMonthStart.getTime();
  const comparisonStart = addMonths(currentMonthStart, -1);

  return {
    // 前月が短い場合は、前月末を越えない範囲で同じ経過時間を比較する
    comparisonEnd: new Date(
      Math.min(comparisonStart.getTime() + elapsed, currentMonthStart.getTime()),
    ),
    comparisonLabel: '前月比',
    comparisonStart,
    listTitle: '日別の使用量',
    periods,
    summaryEnd: now,
    summaryLabel: '今月',
    summaryStart: currentMonthStart,
  };
}

function createWeeklyHistoryDefinition(now: Date): UsageHistoryDefinition {
  const currentWeekStart = startOfWeek(now);
  const periods = Array.from({length: 7}, (_, index) => {
    const start = addDays(currentWeekStart, (index - 6) * 7);
    const naturalEnd = addDays(start, 7);

    return {
      chartLabel: `${start.getMonth() + 1}/${start.getDate()}`,
      detail: `${formatMonthDay(start)}〜${formatMonthDay(addDays(naturalEnd, -1))}`,
      end: naturalEnd.getTime() > now.getTime() ? now : naturalEnd,
      id: start.toISOString(),
      label: `${formatMonthDay(start)}週`,
      start,
    };
  });
  const elapsed = now.getTime() - currentWeekStart.getTime();
  const comparisonStart = addDays(currentWeekStart, -7);

  return {
    comparisonEnd: new Date(comparisonStart.getTime() + elapsed),
    comparisonLabel: '前週比',
    comparisonStart,
    listTitle: '週別の使用量',
    periods,
    summaryEnd: now,
    summaryLabel: '今週',
    summaryStart: currentWeekStart,
  };
}

function createMonthlyHistoryDefinition(now: Date): UsageHistoryDefinition {
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periods = Array.from({length: 6}, (_, index) => {
    const start = addMonths(currentMonthStart, index - 5);
    const naturalEnd = addMonths(start, 1);

    return {
      chartLabel: `${start.getMonth() + 1}月`,
      detail: `${start.getFullYear()}年`,
      end: naturalEnd.getTime() > now.getTime() ? now : naturalEnd,
      id: start.toISOString(),
      label: `${start.getMonth() + 1}月`,
      start,
    };
  });
  const elapsed = now.getTime() - currentMonthStart.getTime();
  const comparisonStart = addMonths(currentMonthStart, -1);
  const comparisonMonthEnd = currentMonthStart.getTime();

  return {
    comparisonEnd: new Date(
      Math.min(comparisonStart.getTime() + elapsed, comparisonMonthEnd),
    ),
    comparisonLabel: '前月比',
    comparisonStart,
    listTitle: '月別の使用量',
    periods,
    summaryEnd: now,
    summaryLabel: '今月',
    summaryStart: currentMonthStart,
  };
}

/**
 * 履歴タブの表示単位に応じて、集計対象と比較対象の期間を生成する
 *
 * この関数はNative Moduleへアクセスしないため、任意の日時を渡して期間計算だけを
 * テストでき、週の開始曜日は月曜日として扱う
 */
export function createUsageHistoryDefinition(
  range: UsageHistoryRange,
  now = new Date(),
): UsageHistoryDefinition {
  switch (range) {
    case 'daily':
      return createDailyHistoryDefinition(now);
    case 'weekly':
      return createWeeklyHistoryDefinition(now);
    case 'monthly':
      return createMonthlyHistoryDefinition(now);
  }
}

/**
 * 現在期間が比較期間から何パーセント増減したかを計算する
 * 比較期間が0 bytesで現在期間に利用がある場合は、有限の割合を算出できないためnullを返す
 */
export function calculateComparisonPercent(
  currentBytes: number,
  previousBytes: number,
): number | null {
  if (previousBytes <= 0) {
    return currentBytes <= 0 ? 0 : null;
  }

  return ((currentBytes - previousBytes) / previousBytes) * 100;
}

/** Androidで「使用状況へのアクセス」が許可されているか確認する */
export async function hasUsageAccess(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  return networkUsageNative.isUsageAccessGranted();
}

/** Androidの使用状況アクセス設定を開き、iOSでは何も行わない */
export async function openUsageAccessSettings(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await networkUsageNative.openUsageAccessSettings();
}

/**
 * ホーム画面で使用する、今月の合計と今日を含む直近7日間の通信量を取得する
 * 月末予測と1日平均も、取得した今月の通信量から算出する
 */
export async function fetchUsageSnapshot(
  limitGb = DEFAULT_LIMIT_GB,
  now = new Date(),
): Promise<UsageSnapshot> {
  if (Platform.OS !== 'android') {
    throw new Error('Automatic data usage retrieval is only available on Android');
  }

  const period = createPeriod(now);
  const recentRanges = createRecentRanges(now);
  const [monthlyBytes, ...dailyBytes] = await Promise.all([
    networkUsageNative.getMobileUsageBytes(period.start, now),
    ...recentRanges.map(range =>
      networkUsageNative.getMobileUsageBytes(range.start, range.end),
    ),
  ]);

  const usedGb = monthlyBytes / BYTES_PER_GB;
  const todayBytes = dailyBytes[dailyBytes.length - 1] ?? 0;
  const elapsed = Math.max(now.getTime() - period.start.getTime(), 1);
  const duration = period.end.getTime() - period.start.getTime();
  const forecastGb = usedGb * (duration / elapsed);
  const elapsedDays = Math.max(Math.ceil(elapsed / (24 * 60 * 60 * 1000)), 1);
  const recentUsage: DailyUsage[] = recentRanges.map((range, index) => ({
    amountGb: (dailyBytes[index] ?? 0) / BYTES_PER_GB,
    date: formatDate(range.start),
    day: DAY_NAMES[range.start.getDay()],
  }));

  return {
    summary: {
      dailyAverageMb: monthlyBytes / BYTES_PER_MB / elapsedDays,
      forecastGb,
      limitGb,
      period: formatPeriod(period.start, period.end),
      todayMb: todayBytes / BYTES_PER_MB,
      updatedAt: `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`,
      usedGb,
    },
    recentUsage,
  };
}

/**
 * 履歴タブで使用する期間別のモバイル通信量をAndroidから取得する
 *
 * - daily: 今月1日から今日までを日単位で表示する
 * - weekly: 今週を含む直近7週間を月曜始まりで表示する
 * - monthly: 今月を含む直近6か月を表示する
 */
export async function fetchUsageHistory(
  range: UsageHistoryRange,
  now = new Date(),
): Promise<UsageHistorySnapshot> {
  if (Platform.OS !== 'android') {
    throw new Error('Automatic data usage retrieval is only available on Android');
  }

  const definition = createUsageHistoryDefinition(range, now);
  const [summaryBytes, comparisonBytes, ...periodBytes] = await Promise.all([
    networkUsageNative.getMobileUsageBytes(
      definition.summaryStart,
      definition.summaryEnd,
    ),
    networkUsageNative.getMobileUsageBytes(
      definition.comparisonStart,
      definition.comparisonEnd,
    ),
    ...definition.periods.map(period =>
      networkUsageNative.getMobileUsageBytes(period.start, period.end),
    ),
  ]);
  const entries: UsageHistoryEntry[] = definition.periods.map(
    (period, index) => ({
      amountGb: (periodBytes[index] ?? 0) / BYTES_PER_GB,
      chartLabel: period.chartLabel,
      detail: period.detail,
      id: period.id,
      label: period.label,
    }),
  );

  return {
    comparisonLabel: definition.comparisonLabel,
    comparisonPercent: calculateComparisonPercent(
      summaryBytes,
      comparisonBytes,
    ),
    entries,
    listTitle: definition.listTitle,
    summaryLabel: definition.summaryLabel,
    totalGb: summaryBytes / BYTES_PER_GB,
  };
}
