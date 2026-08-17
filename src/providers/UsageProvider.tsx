import {
  AppState,
  Platform,
  type AppStateStatus,
} from 'react-native';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {recentUsage, usageSummary} from '../data/mockUsage';
import {
  fetchUsageSnapshot,
  hasUsageAccess,
  openUsageAccessSettings,
} from '../services/usageService';
import type {UsageSnapshot, UsageStatus} from '../types/usage';

type UsageContextValue = UsageSnapshot & {
  error: string | null;
  refresh: () => Promise<void>;
  requestUsageAccess: () => Promise<void>;
  setLimitGb: (limitGb: number) => void;
  status: UsageStatus;
};

const initialSnapshot: UsageSnapshot =
  Platform.OS === 'android'
    ? {
        recentUsage: recentUsage.map(item => ({...item, amountGb: 0})),
        summary: {
          ...usageSummary,
          dailyAverageMb: 0,
          forecastGb: 0,
          todayMb: 0,
          updatedAt: '未取得',
          usedGb: 0,
        },
      }
    : {recentUsage, summary: usageSummary};
const UsageContext = createContext<UsageContextValue | undefined>(undefined);

export function UsageProvider({children}: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [status, setStatus] = useState<UsageStatus>(
    Platform.OS === 'android' ? 'idle' : 'unsupported',
  );
  const [error, setError] = useState<string | null>(null);
  const appState = useRef<AppStateStatus>(
    (AppState.currentState ?? 'active') as AppStateStatus,
  );

  const refresh = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setStatus('unsupported');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const granted = await hasUsageAccess();
      if (!granted) {
        setStatus('permissionRequired');
        return;
      }

      setSnapshot(await fetchUsageSnapshot(snapshot.summary.limitGb));
      setStatus('ready');
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : '通信量を取得できませんでした',
      );
      setStatus('error');
    }
  }, [snapshot.summary.limitGb]);

  const requestUsageAccess = useCallback(async () => {
    try {
      await openUsageAccessSettings();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : '設定画面を開けませんでした',
      );
      setStatus('error');
    }
  }, []);

  const setLimitGb = useCallback((limitGb: number) => {
    setSnapshot(current => ({
      ...current,
      summary: {...current.summary, limitGb: Math.max(1, limitGb)},
    }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        const returnedToForeground =
          appState.current.match(/inactive|background/) &&
          nextState === 'active';
        appState.current = nextState;

        if (returnedToForeground) {
          refresh();
        }
      },
    );

    return () => subscription.remove();
  }, [refresh]);

  const value = useMemo(
    () => ({
      ...snapshot,
      error,
      refresh,
      requestUsageAccess,
      setLimitGb,
      status,
    }),
    [error, refresh, requestUsageAccess, setLimitGb, snapshot, status],
  );

  return (
    <UsageContext.Provider value={value}>{children}</UsageContext.Provider>
  );
}

/** UsageProviderが管理する通信量・権限状態・更新操作を取得する */
export function useUsage(): UsageContextValue {
  const context = useContext(UsageContext);

  if (!context) {
    throw new Error('useUsage must be used within UsageProvider');
  }

  return context;
}
