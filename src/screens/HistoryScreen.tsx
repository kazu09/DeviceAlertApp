import {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Card} from '../components/Card';
import {UsageChart} from '../components/UsageChart';
import {recentUsage, usageHistory} from '../data/mockUsage';
import {useAppTheme} from '../providers/AppThemeProvider';
import type {AppTheme} from '../theme';

type Range = '日別' | '週別' | '月別';
const ranges: Range[] = ['日別', '週別', '月別'];

export function HistoryScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [range, setRange] = useState<Range>('日別');

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View>
        <Text style={styles.eyebrow}>通信量を振り返る</Text>
        <Text style={styles.title}>使用履歴</Text>
      </View>

      <View style={styles.segmentedControl}>
        {ranges.map(item => {
          const selected = range === item;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{selected}}
              key={item}
              onPress={() => setRange(item)}
              style={[
                styles.segment,
                selected ? styles.segmentSelected : undefined,
              ]}>
              <Text
                style={[
                  styles.segmentText,
                  selected ? styles.segmentTextSelected : undefined,
                ]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.cardLabel}>直近7日間</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalValue}>4.16</Text>
              <Text style={styles.totalUnit}>GB</Text>
            </View>
          </View>
          <View style={styles.comparisonBadge}>
            <Text style={styles.comparisonText}>↓ 12% 前週比</Text>
          </View>
        </View>
        <UsageChart data={recentUsage} height={150} showValues />
      </Card>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>日別の使用量</Text>
        <Text style={styles.listUnit}>単位 GB</Text>
      </View>

      <Card style={styles.listCard}>
        {usageHistory.map((item, index) => {
          const percentage = Math.min((item.amountGb / 1.2) * 100, 100);
          return (
            <View
              key={item.date}
              style={[
                styles.historyRow,
                index < usageHistory.length - 1 ? styles.rowBorder : undefined,
              ]}>
              <View style={styles.dateBlock}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.day}>{item.day}曜日</Text>
              </View>
              <View style={styles.miniTrack}>
                <View style={[styles.miniFill, {width: `${percentage}%`}]} />
              </View>
              <Text style={styles.amount}>{item.amountGb.toFixed(2)}</Text>
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      gap: 16,
      paddingBottom: 28,
      paddingHorizontal: 20,
      paddingTop: 14,
    },
    eyebrow: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 4,
    },
    title: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.7,
    },
    segmentedControl: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 14,
      flexDirection: 'row',
      padding: 4,
    },
    segment: {
      alignItems: 'center',
      borderRadius: 11,
      flex: 1,
      paddingVertical: 9,
    },
    segmentSelected: {
      backgroundColor: theme.colors.surface,
    },
    segmentText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    segmentTextSelected: {
      color: theme.colors.text,
      fontWeight: '700',
    },
    summaryRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    cardLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    totalRow: {
      alignItems: 'baseline',
      flexDirection: 'row',
      gap: 5,
      marginTop: 4,
    },
    totalValue: {
      color: theme.colors.text,
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: -1,
    },
    totalUnit: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: '700',
    },
    comparisonBadge: {
      backgroundColor: theme.colors.successSoft,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    comparisonText: {
      color: theme.colors.success,
      fontSize: 11,
      fontWeight: '700',
    },
    listHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    listUnit: {
      color: theme.colors.textMuted,
      fontSize: 11,
    },
    listCard: {
      paddingBottom: 4,
      paddingTop: 4,
    },
    historyRow: {
      alignItems: 'center',
      flexDirection: 'row',
      minHeight: 58,
    },
    rowBorder: {
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
    },
    dateBlock: {
      width: 64,
    },
    date: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    day: {
      color: theme.colors.textMuted,
      fontSize: 10,
      marginTop: 2,
    },
    miniTrack: {
      backgroundColor: theme.colors.track,
      borderRadius: 3,
      flex: 1,
      height: 6,
      marginHorizontal: 10,
      overflow: 'hidden',
    },
    miniFill: {
      backgroundColor: theme.colors.primary,
      borderRadius: 3,
      height: '100%',
    },
    amount: {
      color: theme.colors.text,
      fontSize: 13,
      fontVariant: ['tabular-nums'],
      fontWeight: '700',
      textAlign: 'right',
      width: 42,
    },
  });
}
