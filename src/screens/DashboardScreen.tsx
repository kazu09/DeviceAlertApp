import {Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Card} from '../components/Card';
import {ProgressBar} from '../components/ProgressBar';
import {UsageChart} from '../components/UsageChart';
import {recentUsage, usageSummary} from '../data/mockUsage';
import {useAppTheme} from '../providers/AppThemeProvider';
import type {AppTheme} from '../theme';

export function DashboardScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const progress = (usageSummary.usedGb / usageSummary.limitGb) * 100;
  const remainingGb = usageSummary.limitGb - usageSummary.usedGb;
  const isAndroid = Platform.OS === 'android';

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>2026年8月</Text>
          <Text style={styles.title}>データ使用量</Text>
        </View>
        <View style={styles.sourceBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.sourceText}>
            {isAndroid ? '自動取得' : '手入力'}
          </Text>
        </View>
      </View>

      <Card style={styles.usageCard}>
        <View style={styles.periodRow}>
          <Text style={styles.period}>{usageSummary.period}</Text>
          <Text style={styles.updated}>更新 {usageSummary.updatedAt}</Text>
        </View>
        <View style={styles.usageValueRow}>
          <Text style={styles.usageValue}>{usageSummary.usedGb}</Text>
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
          <Text style={styles.forecastMessage}>このペースなら上限以内です</Text>
        </View>
        <View style={styles.forecastValueBlock}>
          <Text style={styles.forecastValue}>{usageSummary.forecastGb}</Text>
          <Text style={styles.forecastUnit}>GB</Text>
        </View>
      </Card>

      <View style={styles.statGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.cardLabel}>今日</Text>
          <Text style={styles.statValue}>{usageSummary.todayMb}</Text>
          <Text style={styles.statUnit}>MB</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.cardLabel}>1日平均</Text>
          <Text style={styles.statValue}>{usageSummary.dailyAverageMb}</Text>
          <Text style={styles.statUnit}>MB</Text>
        </Card>
      </View>

      <Card>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>最近7日間</Text>
            <Text style={styles.sectionCaption}>モバイルデータ通信</Text>
          </View>
          <Text style={styles.sectionTotal}>4.16 GB</Text>
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

      <View style={styles.insight}>
        <Text style={styles.insightMark}>i</Text>
        <Text style={styles.insightText}>
          先週より1日あたり約80 MB少ないペースです。
        </Text>
      </View>
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
