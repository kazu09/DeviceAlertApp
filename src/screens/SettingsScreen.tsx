import {useState} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {Card} from '../components/Card';
import {useAppTheme} from '../providers/AppThemeProvider';
import type {AppTheme} from '../theme';

export function SettingsScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [limitGb, setLimitGb] = useState(20);
  const [alert50, setAlert50] = useState(false);
  const [alert80, setAlert80] = useState(true);
  const [alert100, setAlert100] = useState(true);
  const isAndroid = Platform.OS === 'android';

  const switchProps = {
    trackColor: {
      false: theme.colors.track,
      true: theme.colors.primarySoft,
    },
    thumbColor: theme.colors.primary,
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View>
        <Text style={styles.eyebrow}>アプリをカスタマイズ</Text>
        <Text style={styles.title}>設定</Text>
      </View>

      <Text style={styles.sectionLabel}>データプラン</Text>
      <Card>
        <View style={styles.settingHeader}>
          <View>
            <Text style={styles.settingTitle}>月間データ上限</Text>
            <Text style={styles.settingDescription}>
              予測と通知の基準になります
            </Text>
          </View>
          <View style={styles.stepper}>
            <Pressable
              accessibilityLabel="データ上限を1GB減らす"
              onPress={() => setLimitGb(value => Math.max(1, value - 1))}
              style={styles.stepButton}>
              <Text style={styles.stepButtonText}>−</Text>
            </Pressable>
            <Text style={styles.limitValue}>{limitGb} GB</Text>
            <Pressable
              accessibilityLabel="データ上限を1GB増やす"
              onPress={() => setLimitGb(value => value + 1)}
              style={styles.stepButton}>
              <Text style={styles.stepButtonText}>＋</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.simpleRow}>
          <View>
            <Text style={styles.settingTitle}>集計開始日</Text>
            <Text style={styles.settingDescription}>毎月の利用期間</Text>
          </View>
          <View style={styles.valuePill}>
            <Text style={styles.valuePillText}>毎月1日</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>通知</Text>
      <Card style={styles.switchCard}>
        <SettingSwitch
          description="早めに使用ペースを確認します"
          label="50%に到達"
          onValueChange={setAlert50}
          value={alert50}
          {...switchProps}
        />
        <View style={styles.divider} />
        <SettingSwitch
          description="上限が近いことを通知します"
          label="80%に到達"
          onValueChange={setAlert80}
          value={alert80}
          {...switchProps}
        />
        <View style={styles.divider} />
        <SettingSwitch
          description="設定した上限を超えました"
          label="100%に到達"
          onValueChange={setAlert100}
          value={alert100}
          {...switchProps}
        />
      </Card>

      <Text style={styles.sectionLabel}>データ取得</Text>
      <Card>
        <View style={styles.dataSourceRow}>
          <View style={styles.dataSourceIcon}>
            <Text style={styles.dataSourceIconText}>{isAndroid ? 'A' : 'i'}</Text>
          </View>
          <View style={styles.dataSourceCopy}>
            <Text style={styles.settingTitle}>
              {isAndroid ? 'Android 自動取得' : 'iOS 使用量入力'}
            </Text>
            <Text style={styles.settingDescription}>
              {isAndroid
                ? '端末の使用状況データから更新します'
                : '手入力またはスクリーンショットで更新します'}
            </Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>
              {isAndroid ? '有効' : '設定済み'}
            </Text>
          </View>
        </View>
        <Pressable style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>
            {isAndroid ? 'アクセス権限を確認' : '使用量を更新'}
          </Text>
        </Pressable>
      </Card>

      <Text style={styles.version}>DeviceAlertApp · UI Preview</Text>
    </ScrollView>
  );
}

type SettingSwitchProps = {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  trackColor: {false: string; true: string};
  thumbColor: string;
};

function SettingSwitch({
  label,
  description,
  value,
  onValueChange,
  trackColor,
  thumbColor,
}: SettingSwitchProps) {
  const theme = useAppTheme();
  return (
    <View style={stylesStatic.switchRow}>
      <View style={stylesStatic.switchCopy}>
        <Text style={[stylesStatic.switchTitle, {color: theme.colors.text}]}>
          {label}
        </Text>
        <Text
          style={[
            stylesStatic.switchDescription,
            {color: theme.colors.textMuted},
          ]}>
          {description}
        </Text>
      </View>
      <Switch
        onValueChange={onValueChange}
        thumbColor={thumbColor}
        trackColor={trackColor}
        value={value}
      />
    </View>
  );
}

const stylesStatic = StyleSheet.create({
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 62,
  },
  switchCopy: {
    flex: 1,
    paddingRight: 12,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchDescription: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      gap: 14,
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
    sectionLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginBottom: -6,
      marginLeft: 4,
      marginTop: 4,
      textTransform: 'uppercase',
    },
    settingHeader: {
      gap: 18,
    },
    settingTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    settingDescription: {
      color: theme.colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 4,
    },
    stepper: {
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 5,
    },
    stepButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      height: 38,
      justifyContent: 'center',
      width: 48,
    },
    stepButtonText: {
      color: theme.colors.primary,
      fontSize: 20,
      fontWeight: '700',
    },
    limitValue: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '800',
    },
    divider: {
      backgroundColor: theme.colors.border,
      height: 1,
      marginVertical: 14,
    },
    simpleRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    valuePill: {
      backgroundColor: theme.colors.primarySoft,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    valuePillText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '700',
    },
    switchCard: {
      paddingBottom: 8,
      paddingTop: 8,
    },
    dataSourceRow: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    dataSourceIcon: {
      alignItems: 'center',
      backgroundColor: theme.colors.primarySoft,
      borderRadius: 14,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    dataSourceIconText: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: '800',
    },
    dataSourceCopy: {
      flex: 1,
      marginLeft: 12,
      paddingRight: 8,
    },
    activeBadge: {
      backgroundColor: theme.colors.successSoft,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },
    activeBadgeText: {
      color: theme.colors.success,
      fontSize: 10,
      fontWeight: '700',
    },
    permissionButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 13,
      marginTop: 18,
      paddingVertical: 12,
    },
    permissionButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
    version: {
      color: theme.colors.textMuted,
      fontSize: 11,
      marginTop: 6,
      textAlign: 'center',
    },
  });
}
