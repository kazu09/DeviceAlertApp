import type {DailyUsage, UsageSummary} from '../types/usage';

export const usageSummary: UsageSummary = {
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
