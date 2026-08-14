import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {FC} from 'react';
import {StyleSheet} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import HistoryIcon from '../assets/icons/history_24.svg';
import HomeIcon from '../assets/icons/home_24.svg';
import SettingsIcon from '../assets/icons/settings_24.svg';
import {DashboardScreen} from '../screens/DashboardScreen';
import {HistoryScreen} from '../screens/HistoryScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {useAppTheme} from '../providers/AppThemeProvider';

export type RootTabParamList = {
  HomeTab: undefined;
  HistoryTab: undefined;
  SettingsTab: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
};

export type HistoryStackParamList = {
  History: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

type TabIconProps = {
  color: string;
  size: number;
};

function TabIcon({
  color,
  Icon,
  size,
}: TabIconProps & {Icon: FC<SvgProps>}) {
  return <Icon fill={color} height={size} width={size} />;
}

function HomeTabIcon({color, size}: TabIconProps) {
  return <TabIcon color={color} Icon={HomeIcon} size={size} />;
}

function HistoryTabIcon({color, size}: TabIconProps) {
  return <TabIcon color={color} Icon={HistoryIcon} size={size} />;
}

function SettingsTabIcon({color, size}: TabIconProps) {
  return <TabIcon color={color} Icon={SettingsIcon} size={size} />;
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{headerShown: false}}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
    </HomeStack.Navigator>
  );
}

function HistoryNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{headerShown: false}}>
      <HistoryStack.Screen name="History" component={HistoryScreen} />
    </HistoryStack.Navigator>
  );
}

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{headerShown: false}}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

export function AppNavigator() {
  const theme = useAppTheme();
  const navigationTheme: NavigationTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      border: theme.colors.border,
      card: theme.colors.surface,
      notification: theme.colors.danger,
      primary: theme.colors.primary,
      text: theme.colors.text,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarLabelStyle: styles.label,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
        }}>
        <Tab.Screen
          component={HomeNavigator}
          name="HomeTab"
          options={{tabBarIcon: HomeTabIcon, tabBarLabel: 'ホーム'}}
        />
        <Tab.Screen
          component={HistoryNavigator}
          name="HistoryTab"
          options={{tabBarIcon: HistoryTabIcon, tabBarLabel: '履歴'}}
        />
        <Tab.Screen
          component={SettingsNavigator}
          name="SettingsTab"
          options={{tabBarIcon: SettingsTabIcon, tabBarLabel: '設定'}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
