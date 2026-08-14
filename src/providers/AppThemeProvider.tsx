import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import {useColorScheme} from 'react-native';
import {createTheme, type AppTheme} from '../theme';

const AppThemeContext = createContext<AppTheme | undefined>(undefined);

export function AppThemeProvider({children}: PropsWithChildren) {
  const isDark = useColorScheme() === 'dark';
  const theme = useMemo(() => createTheme(isDark), [isDark]);

  return (
    <AppThemeContext.Provider value={theme}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppTheme {
  const theme = useContext(AppThemeContext);

  if (!theme) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return theme;
}
