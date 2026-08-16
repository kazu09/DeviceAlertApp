import {StatusBar, StyleSheet} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import {AppNavigator} from './src/navigation/AppNavigator';
import {
  AppThemeProvider,
  useAppTheme,
} from './src/providers/AppThemeProvider';
import {UsageProvider} from './src/providers/UsageProvider';

function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <UsageProvider>
          <AppContent />
        </UsageProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const theme = useAppTheme();

  return (
    <>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView
        edges={['top']}
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <AppNavigator />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
