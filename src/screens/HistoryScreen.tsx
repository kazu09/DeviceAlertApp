import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Card} from '../components/Card';
import {UsageChart} from '../components/UsageChart';
import {useAppTheme} from '../providers/AppThemeProvider';
import {useUsage} from '../providers/UsageProvider';
import {fetchUsageHistory} from '../services/usageService';
import type {AppTheme} from '../theme';
import type {
  UsageHistoryRange,
  UsageHistorySnapshot,
} from '../types/usage';

const ranges: {label: string; value: UsageHistoryRange}[] = [
  {label: '日別', value: 'daily'},
  {label: '週別', value: 'weekly'},
  {label: '月別', value: 'monthly'},
];

type HistoryStatus = 'idle' | 'loading' | 'ready' | 'error' | 'unsupported';

export function HistoryScreen() {
  const theme = useAppTheme();
  const {
    error: usageError,
    refresh,
    requestUsageAccess,
    status: usageStatus,
  } = useUsage();
  const styles = createStyles(theme);
  const [range, setRange] = useState<UsageHistoryRange>('daily');
  const [history, setHistory] = useState<UsageHistorySnapshot | null>(null);
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>('idle');
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    if (Platform.OS !== 'android') {
      setHistoryStatus('unsupported');
      return () => {
        active = false;
      };
    }

    if (usageStatus !== 'ready') {
      setHistory(null);
      setHistoryError(null);
      setHistoryStatus(usageStatus === 'loading' ? 'loading' : 'idle');
      return () => {
        active = false;
      };
    }

    setHistory(null);
    setHistoryError(null);
    setHistoryStatus('loading');

    fetchUsageHistory(range)
      .then(result => {
        if (active) {
          setHistory(result);
          setHistoryStatus('ready');
        }
      })
      .catch(cause => {
        if (active) {
          setHistoryError(
            cause instanceof Error
              ? cause.message
              : '通信履歴を取得できませんでした',
          );
          setHistoryStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, [range, reloadKey, usageStatus]);

  const comparisonPercent = history?.comparisonPercent ?? null;
  const comparisonIncreased = (comparisonPercent ?? 0) > 0;
  const comparisonDecreased = (comparisonPercent ?? 0) < 0;
  const comparisonText = history
    ? comparisonPercent === null
      ? `比較データなし · ${history.comparisonLabel}`
      : `${comparisonIncreased ? '↑' : comparisonDecreased ? '↓' : '→'} ${Math.abs(
          comparisonPercent,
        ).toFixed(0)}% ${history.comparisonLabel}`
    : '';
  const maxUsageGb = Math.max(
    ...(history?.entries.map(item => item.amountGb) ?? [0]),
    0.001,
  );
  const chartWidth = Math.max((history?.entries.length ?? 0) * 44, 300);

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
          const selected = range === item.value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{selected}}
              key={item.value}
              onPress={() => setRange(item.value)}
              style={[
                styles.segment,
                selected ? styles.segmentSelected : undefined,
              ]}>
              <Text
                style={[
                  styles.segmentText,
                  selected ? styles.segmentTextSelected : undefined,
                ]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {usageStatus === 'permissionRequired' ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateTitle}>通信履歴へのアクセスが必要です</Text>
          <Text style={styles.stateDescription}>
            Androidの設定で、このアプリの使用状況へのアクセスを有効にしてください。
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={requestUsageAccess}
            style={styles.stateButton}>
            <Text style={styles.stateButtonText}>設定を開く</Text>
          </Pressable>
        </Card>
      ) : usageStatus === 'error' ? (
        <HistoryErrorCard
          error={usageError ?? '通信量を取得できませんでした'}
          onRetry={refresh}
          styles={styles}
        />
      ) : historyStatus === 'unsupported' ? (
        <Card style={styles.stateCard}>
          <Text style={styles.stateTitle}>iOSの履歴取得は未対応です</Text>
          <Text style={styles.stateDescription}>
            iOSでは端末全体のモバイル通信量を自動取得できません。
          </Text>
        </Card>
      ) : historyStatus === 'loading' || usageStatus === 'loading' ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.stateDescription}>通信履歴を取得しています…</Text>
        </Card>
      ) : historyStatus === 'error' ? (
        <HistoryErrorCard
          error={historyError ?? '通信履歴を取得できませんでした'}
          onRetry={() => setReloadKey(current => current + 1)}
          styles={styles}
        />
      ) : history ? (
        <>
          <Card>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.cardLabel}>{history.summaryLabel}</Text>
                <View style={styles.totalRow}>
                  <Text style={styles.totalValue}>
                    {history.totalGb.toFixed(2)}
                  </Text>
                  <Text style={styles.totalUnit}>GB</Text>
                </View>
              </View>
              <View
                style={[
                  styles.comparisonBadge,
                  comparisonIncreased
                    ? styles.comparisonBadgeIncreased
                    : comparisonPercent === null
                      ? styles.comparisonBadgeNeutral
                      : undefined,
                ]}>
                <Text
                  style={[
                    styles.comparisonText,
                    comparisonIncreased
                      ? styles.comparisonTextIncreased
                      : comparisonPercent === null
                        ? styles.comparisonTextNeutral
                        : undefined,
                  ]}>
                  {comparisonText}
                </Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chartScroll}>
              <View style={{width: chartWidth}}>
                <UsageChart
                  data={history.entries.map(item => ({
                    amountGb: item.amountGb,
                    date: item.id,
                    day: item.chartLabel,
                  }))}
                  height={150}
                  showValues
                />
              </View>
            </ScrollView>
          </Card>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>{history.listTitle}</Text>
            <Text style={styles.listUnit}>単位 GB</Text>
          </View>

          <Card style={styles.listCard}>
            {history.entries
              .slice()
              .reverse()
              .map((item, index) => {
                const percentage = Math.min(
                  (item.amountGb / maxUsageGb) * 100,
                  100,
                );
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.historyRow,
                      index < history.entries.length - 1
                        ? styles.rowBorder
                        : undefined,
                    ]}>
                    <View style={styles.dateBlock}>
                      <Text style={styles.date}>{item.label}</Text>
                      <Text style={styles.day}>{item.detail}</Text>
                    </View>
                    <View style={styles.miniTrack}>
                      <View
                        style={[styles.miniFill, {width: `${percentage}%`}]}
                      />
                    </View>
                    <Text style={styles.amount}>{item.amountGb.toFixed(2)}</Text>
                  </View>
                );
              })}
          </Card>
        </>
      ) : null}
    </ScrollView>
  );
}

type HistoryStyles = ReturnType<typeof createStyles>;

function HistoryErrorCard({
  error,
  onRetry,
  styles,
}: {
  error: string;
  onRetry: () => void;
  styles: HistoryStyles;
}) {
  return (
    <Card style={styles.stateCard}>
      <Text style={styles.stateTitle}>通信履歴を取得できませんでした</Text>
      <Text style={styles.stateDescription}>{error}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={styles.stateButton}>
        <Text style={styles.stateButtonText}>再試行</Text>
      </Pressable>
    </Card>
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
    chartScroll: {
      marginHorizontal: -2,
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
    comparisonBadgeIncreased: {
      backgroundColor: theme.colors.warningSoft,
    },
    comparisonBadgeNeutral: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    comparisonText: {
      color: theme.colors.success,
      fontSize: 11,
      fontWeight: '700',
    },
    comparisonTextIncreased: {
      color: theme.colors.danger,
    },
    comparisonTextNeutral: {
      color: theme.colors.textMuted,
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
    loadingCard: {
      alignItems: 'center',
      gap: 12,
      paddingVertical: 32,
    },
    stateButton: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      marginTop: 4,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    stateButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
      fontWeight: '700',
    },
    stateCard: {
      gap: 8,
    },
    stateDescription: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 20,
    },
    stateTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
