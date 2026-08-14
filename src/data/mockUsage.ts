export type DailyUsage = {
  date: string;
  day: string;
  amountGb: number;
};

export const usageSummary = {
  period: '8月1日〜8月31日',
  usedGb: 8.4,
  limitGb: 20,
  todayMb: 620,
  dailyAverageMb: 410,
  forecastGb: 12.7,
  updatedAt: 'たった今',
};

export const recentUsage: DailyUsage[] = [
  {date: '8/7', day: '木', amountGb: 0.32},
  {date: '8/8', day: '金', amountGb: 0.68},
  {date: '8/9', day: '土', amountGb: 0.91},
  {date: '8/10', day: '日', amountGb: 0.48},
  {date: '8/11', day: '月', amountGb: 0.39},
  {date: '8/12', day: '火', amountGb: 0.76},
  {date: '8/13', day: '水', amountGb: 0.62},
];

export const usageHistory: DailyUsage[] = [
  ...recentUsage,
  {date: '8/6', day: '水', amountGb: 0.25},
  {date: '8/5', day: '火', amountGb: 1.12},
  {date: '8/4', day: '月', amountGb: 0.44},
  {date: '8/3', day: '日', amountGb: 0.58},
  {date: '8/2', day: '土', amountGb: 0.37},
  {date: '8/1', day: '金', amountGb: 0.29},
].sort((a, b) => Number(b.date.split('/')[1]) - Number(a.date.split('/')[1]));
