import {
  calculateComparisonPercent,
  createUsageHistoryDefinition,
} from '../src/services/usageService';

const NOW = new Date(2026, 7, 16, 12, 0, 0);

describe('createUsageHistoryDefinition', () => {
  test('creates every daily period from the first of the current month', () => {
    const definition = createUsageHistoryDefinition('daily', NOW);

    expect(definition.summaryLabel).toBe('今月');
    expect(definition.comparisonLabel).toBe('前月比');
    expect(definition.periods).toHaveLength(16);
    expect(definition.periods[0].label).toBe('8/1');
    expect(definition.periods.at(-1)?.label).toBe('8/16');
    expect(definition.summaryStart).toEqual(new Date(2026, 7, 1));
    expect(definition.comparisonStart).toEqual(new Date(2026, 6, 1));
    expect(definition.comparisonEnd).toEqual(new Date(2026, 6, 16, 12));
    expect(definition.periods.at(-1)?.end).toEqual(NOW);
  });

  test('creates Monday-based weekly periods and a same-duration comparison', () => {
    const definition = createUsageHistoryDefinition('weekly', NOW);
    const currentDuration =
      definition.summaryEnd.getTime() - definition.summaryStart.getTime();
    const comparisonDuration =
      definition.comparisonEnd.getTime() -
      definition.comparisonStart.getTime();

    expect(definition.summaryLabel).toBe('今週');
    expect(definition.comparisonLabel).toBe('前週比');
    expect(definition.periods).toHaveLength(7);
    expect(definition.periods.at(-1)?.label).toBe('8/10週');
    expect(definition.summaryStart.getDay()).toBe(1);
    expect(comparisonDuration).toBe(currentDuration);
  });

  test('creates the latest six monthly periods', () => {
    const definition = createUsageHistoryDefinition('monthly', NOW);

    expect(definition.summaryLabel).toBe('今月');
    expect(definition.comparisonLabel).toBe('前月比');
    expect(definition.periods.map(period => period.chartLabel)).toEqual([
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
    ]);
    expect(definition.comparisonStart).toEqual(new Date(2026, 6, 1));
    expect(definition.comparisonEnd).toEqual(new Date(2026, 6, 16, 12));
  });
});

describe('calculateComparisonPercent', () => {
  test('calculates increase and decrease percentages', () => {
    expect(calculateComparisonPercent(120, 100)).toBeCloseTo(20);
    expect(calculateComparisonPercent(75, 100)).toBeCloseTo(-25);
  });

  test('handles a comparison period with no usage', () => {
    expect(calculateComparisonPercent(0, 0)).toBe(0);
    expect(calculateComparisonPercent(1, 0)).toBeNull();
  });
});
