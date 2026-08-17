import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Card} from '../components/Card';
import {ProgressBar} from '../components/ProgressBar';
import {UsageChart} from '../components/UsageChart';
import {useAppTheme} from '../providers/AppThemeProvider';
import {useUsage} from '../providers/UsageProvider';
import type {AppTheme} from '../theme';

export function DashboardScreen() {
  const theme = useAppTheme();
  const {
    error,
    recentUsage,
    refresh,
    requestUsageAccess,
    status,
    summary: usageSummary,
  } = useUsage();
  const styles = createStyles(theme);
  const progress = (usageSummary.usedGb / usageSummary.limitGb) * 100;
  const remainingGb = Math.max(
    usageSummary.limitGb - usageSummary.usedGb,
    0,
  );
  const recentTotalGb = recentUsage.reduce(
    (total, item) => total + item.amountGb,
    0,
  );
  const recentPeriod =
    recentUsage.length > 0
      ? `${recentUsage[0].date}〜${recentUsage[recentUsage.length - 1].date}`
      : '';
  const isAndroid = Platform.OS === 'android';
  const needsPermission = isAndroid && status === 'permissionRequired';
  const hasError = isAndroid && status === 'error';
  const sourceLabel = !isAndroid
    ? '手入力'
    : status === 'ready'
      ? '自動取得'
      : status === 'loading'
        ? '取得中'
        : needsPermission
          ? '権限が必要'
          : '未取得';

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>2026年8月</Text>
          <Text style={styles.title}>データ使用量</Text>
        </View>
        <View
          style={[
            styles.sourceBadge,
            needsPermission || hasError ? styles.sourceBadgeWarning : undefined,
          ]}>
          <View
            style={[
              styles.statusDot,
              needsPermission || hasError ? styles.statusDotWarning : undefined,
            ]}
          />
          <Text
            style={[
              styles.sourceText,
              needsPermission || hasError
                ? styles.sourceTextWarning
                : undefined,
            ]}>
            {sourceLabel}
          </Text>
        </View>
      </View>

      {needsPermission || hasError ? (
        <Card style={styles.noticeCard}>
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>
              {needsPermission
                ? '通信量へのアクセスを許可してください'
                : '通信量を取得できませんでした'}
            </Text>
            <Text style={styles.noticeDescription}>
              {needsPermission
                ? 'Androidの設定画面で、このアプリの使用状況へのアクセスを有効にします。'
                : error ?? '時間をおいてもう一度お試しください。'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              needsPermission ? requestUsageAccess() : refresh();
            }}
            style={styles.noticeButton}>
            <Text style={styles.noticeButtonText}>
              {needsPermission ? '設定を開く' : '再試行'}
            </Text>
          </Pressable>
        </Card>
      ) : null}

      <Card style={styles.usageCard}>
        <View style={styles.periodRow}>
          <Text style={styles.period}>{usageSummary.period}</Text>
          <Text style={styles.updated}>更新 {usageSummary.updatedAt}</Text>
        </View>
        <View style={styles.usageValueRow}>
          <Text style={styles.usageValue}>
            {usageSummary.usedGb.toFixed(2)}
          </Text>
          <View style={styles.usageUnitBlock}>
            <Text style={styles.usageUnit}>GB</Text>
            <Text style={styles.limit}>/ {usageSummary.limitGb} GB</Text>
          </View>
        </View>
        <ProgressBar progress={progress} />
        <View style={styles.progressMeta}>
          <Text style={styles.metaText}>残り {remainingGb.toFixed(1)} GB</Text>
          <Text style={styles.metaStrong}>使用率 {Math.round(progress)}%</Text>
        </View>
      </Card>

      <Card style={styles.forecastCard}>
        <View style={styles.forecastIcon}>
          <Text style={styles.forecastIconText}>↗</Text>
        </View>
        <View style={styles.forecastCopy}>
          <Text style={styles.cardLabel}>月末予測</Text>
          <Text style={styles.forecastMessage}>
            {usageSummary.forecastGb > usageSummary.limitGb
              ? 'このペースでは上限を超える見込みです'
              : 'このペースなら上限以内です'}
          </Text>
        </View>
        <View style={styles.forecastValueBlock}>
          <Text style={styles.forecastValue}>
            {usageSummary.forecastGb.toFixed(1)}
          </Text>
          <Text style={styles.forecastUnit}>GB</Text>
        </View>
      </Card>

      <View style={styles.statGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.cardLabel}>今日</Text>
          <Text style={styles.statValue}>{Math.round(usageSummary.todayMb)}</Text>
          <Text style={styles.statUnit}>MB</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.cardLabel}>1日平均</Text>
          <Text style={styles.statValue}>
            {Math.round(usageSummary.dailyAverageMb)}
          </Text>
          <Text style={styles.statUnit}>MB</Text>
        </Card>
      </View>

      <Card>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>直近7日間（今日を含む）</Text>
            <Text style={styles.sectionCaption}>
              {recentPeriod} · モバイルデータ通信
            </Text>
          </View>
          <Text style={styles.sectionTotal}>{recentTotalGb.toFixed(2)} GB</Text>
        </View>
        <UsageChart data={recentUsage} />
      </Card>

      {!isAndroid ? (
        <Card style={styles.importCard}>
          <View style={styles.importCopy}>
            <Text style={styles.importTitle}>使用量を更新</Text>
            <Text style={styles.importDescription}>
              スクリーンショットまたは手入力で更新できます
            </Text>
          </View>
          <View style={styles.importButton}>
            <Text style={styles.importButtonText}>更新する</Text>
          </View>
        </Card>
      ) : null}

      {!isAndroid ? (
        <View style={styles.insight}>
          <Text style={styles.insightMark}>i</Text>
          <Text style={styles.insightText}>
            先週より1日あたり約80 MB少ないペースです。
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      gap: 14,
      paddingBottom: 28,
      paddingHorizontal: 20,
      paddingTop: 14,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    eyebrow: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.2,
      marginBottom: 4,
    },
    title: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.7,
    },
    sourceBadge: {
      alignItems: 'center',
      backgroundColor: theme.colors.successSoft,
      borderRadius: 999,
      flexDirection: 'row',
      gap: 6,
      paddingHorizontal: 11,
      paddingVertical: 7,
    },
    statusDot: {
      backgroundColor: theme.colors.success,
      borderRadius: 4,
      height: 7,
      width: 7,
    },
    sourceText: {
      color: theme.colors.success,
      fontSize: 12,
      fontWeight: '700',
    },
    sourceBadgeWarning: {
      backgroundColor: theme.colors.warningSoft,
    },
    statusDotWarning: {
      backgroundColor: theme.colors.warning,
    },
    sourceTextWarning: {
      color: theme.colors.warning,
    },
    noticeCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.warningSoft,
      borderColor: 'transparent',
      flexDirection: 'row',
      gap: 12,
      paddingVertical: 15,
    },
    noticeCopy: {
      flex: 1,
    },
    noticeTitle: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    noticeDescription: {
      color: theme.colors.textMuted,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 4,
    },
    noticeButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    noticeButtonText: {
      color: theme.colors.warning,
      fontSize: 11,
      fontWeight: '700',
    },
    usageCard: {
      paddingBottom: 18,
    },
    periodRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    period: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    updated: {
      color: theme.colors.textMuted,
      fontSize: 11,
    },
    usageValueRow: {
      alignItems: 'flex-end',
      flexDirection: 'row',
      marginBottom: 20,
      marginTop: 18,
    },
    usageValue: {
      color: theme.colors.text,
      fontSize: 52,
      fontWeight: '800',
      letterSpacing: -2,
      lineHeight: 58,
    },
    usageUnitBlock: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 7,
      marginLeft: 8,
    },
    usageUnit: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    limit: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: '600',
      paddingTop: 3,
    },
    progressMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 11,
    },
    metaText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '500',
    },
    metaStrong: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    forecastCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.primarySoft,
      borderColor: 'transparent',
      flexDirection: 'row',
      paddingVertical: 16,
    },
    forecastIcon: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 15,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    forecastIconText: {
      color: theme.colors.primary,
      fontSize: 22,
      fontWeight: '700',
    },
    forecastCopy: {
      flex: 1,
      marginLeft: 13,
    },
    cardLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    forecastMessage: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 4,
    },
    forecastValueBlock: {
      alignItems: 'baseline',
      flexDirection: 'row',
      gap: 4,
    },
    forecastValue: {
      color: theme.colors.text,
      fontSize: 26,
      fontWeight: '800',
    },
    forecastUnit: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    statGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      paddingVertical: 16,
    },
    statValue: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.7,
      marginTop: 8,
    },
    statUnit: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 1,
    },
    sectionHeader: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    sectionCaption: {
      color: theme.colors.textMuted,
      fontSize: 11,
      marginTop: 3,
    },
    sectionTotal: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: '800',
    },
    importCard: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    importCopy: {
      flex: 1,
      paddingRight: 12,
    },
    importTitle: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    importDescription: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },
    importButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    importButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    insight: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 16,
      flexDirection: 'row',
      gap: 10,
      padding: 14,
    },
    insightMark: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '800',
    },
    insightText: {
      color: theme.colors.textMuted,
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
