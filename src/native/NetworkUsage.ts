import NativeNetworkUsage from '../specs/NativeNetworkUsage';

function getNativeModule() {
  if (!NativeNetworkUsage) {
    throw new Error('NetworkUsage Native Module is only available on Android');
  }

  return NativeNetworkUsage;
}

/**
 * AndroidのNetworkUsage Native Moduleを、Dateを受け取るTypeScript APIとして公開する
 * Native側との境界ではDateをUnix epochからのミリ秒へ変換する
 */
export const networkUsageNative = {
  /** 使用状況へのアクセス権限が許可されているか確認する */
  isUsageAccessGranted(): Promise<boolean> {
    return getNativeModule().isUsageAccessGranted();
  },

  /** このアプリの使用状況アクセス設定を開く */
  openUsageAccessSettings(): Promise<void> {
    return getNativeModule().openUsageAccessSettings();
  },

  /** 指定した半開区間[startTime, endTime)のモバイル通信量をbytesで取得する */
  getMobileUsageBytes(startTime: Date, endTime: Date): Promise<number> {
    return getNativeModule().getMobileUsageBytes(
      startTime.getTime(),
      endTime.getTime(),
    );
  },
};
