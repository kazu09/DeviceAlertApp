import type {PropsWithChildren} from 'react';
import {StyleSheet, View, type ViewStyle} from 'react-native';
import {useAppTheme} from '../providers/AppThemeProvider';

type Props = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function Card({children, style}: Props) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
  },
});
