import {StyleSheet, View} from 'react-native';
import {useAppTheme} from '../providers/AppThemeProvider';

type Props = {
  progress: number;
};

export function ProgressBar({progress}: Props) {
  const theme = useAppTheme();
  const safeProgress = Math.max(0, Math.min(progress, 100));
  const color =
    safeProgress >= 100
      ? theme.colors.danger
      : safeProgress >= 80
        ? theme.colors.warning
        : theme.colors.primary;

  return (
    <View style={[styles.track, {backgroundColor: theme.colors.track}]}>
      <View
        accessibilityLabel={`データ使用率 ${Math.round(safeProgress)}パーセント`}
        style={[
          styles.fill,
          {backgroundColor: color, width: `${safeProgress}%`},
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 6,
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 6,
    height: '100%',
  },
});
