import {StyleSheet, Text, View} from 'react-native';
import {useAppTheme} from '../providers/AppThemeProvider';
import type {DailyUsage} from '../types/usage';

type Props = {
  data: DailyUsage[];
  height?: number;
  showValues?: boolean;
};

export function UsageChart({
  data,
  height = 112,
  showValues = false,
}: Props) {
  const theme = useAppTheme();
  const max = Math.max(...data.map(item => item.amountGb), 1);

  return (
    <View style={[styles.chart, {height: height + 42}]}>
      {data.map((item, index) => {
        const barHeight = Math.max((item.amountGb / max) * height, 8);
        const isLatest = index === data.length - 1;

        return (
          <View key={`${item.date}-${index}`} style={styles.column}>
            {showValues ? (
              <Text style={[styles.value, {color: theme.colors.textMuted}]}>
                {item.amountGb.toFixed(1)}
              </Text>
            ) : null}
            <View style={[styles.barArea, {height}]}>
              <View
                style={[
                  styles.bar,
                  {
                    backgroundColor: isLatest
                      ? theme.colors.primary
                      : theme.colors.primarySoft,
                    height: barHeight,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.label,
                {color: isLatest ? theme.colors.text : theme.colors.textMuted},
              ]}>
              {item.day}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'space-between',
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 4,
  },
  barArea: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  bar: {
    borderRadius: 8,
    minWidth: 14,
    width: '56%',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
});
