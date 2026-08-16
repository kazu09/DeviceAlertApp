import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

// Codegenは`NativeNetworkUsage.ts`というファイル名をもとに、
// Android用の親クラス`NativeNetworkUsageSpec`を自動生成する
export interface Spec extends TurboModule {
  /** AndroidのPACKAGE_USAGE_STATSに相当する特別なアクセス状態を返す */
  isUsageAccessGranted(): Promise<boolean>;

  /** 使用状況アクセスを許可するためのAndroid設定画面を開く */
  openUsageAccessSettings(): Promise<void>;

  /** 指定した半開区間のモバイル送受信量の合計をbytesで返す */
  getMobileUsageBytes(
    startTimeMillis: number,
    endTimeMillis: number,
  ): Promise<number>;
}

// `NetworkUsage`は実行時にNative Moduleを識別する名前
// Kotlin側のNetworkUsageModule.NAMEと一致させる
export default TurboModuleRegistry.get<Spec>('NetworkUsage');
