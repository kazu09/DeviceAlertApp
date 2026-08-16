package com.devicealertapp

import android.annotation.TargetApi
import android.app.AppOpsManager
import android.app.usage.NetworkStatsManager
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.ConnectivityManager
import android.os.Build
import android.os.Process
import android.provider.Settings
import android.util.Log
import androidx.core.net.toUri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicInteger

/**
 * Androidが記録した端末全体のモバイル通信量をReact Nativeへ提供するTurbo Native Module
 *
 * [NativeNetworkUsageSpec]は`NativeNetworkUsage.ts`からCodegenが生成する親クラスで、
 * TypeScriptのSpecにあるAPIを各`override`で実装する
 * `@ReactMethod`は生成される
 * 親クラス側に付くため、このクラスで付け直す必要はない
 *
 * [Promise]は処理結果をReact Nativeへ返すための受け皿で、成功時は`resolve`、
 * 失敗時は`reject`を呼ぶ
 *
 * プロジェクトのminSdkは30
 * [TargetApi]はIDEがminSdkを1と誤認した場合のAPI警告を防ぐ
 */
@TargetApi(Build.VERSION_CODES.R)
@ReactModule(name = NetworkUsageModule.NAME)
class NetworkUsageModule(
  private val reactContext: ReactApplicationContext,
) : NativeNetworkUsageSpec(reactContext) {
  // NetworkStatsManagerの問い合わせには数秒かかる可能性があるため、UIスレッドでは実行しない
  private val executor = Executors.newSingleThreadExecutor()
  // 同時に依頼された取得処理の開始ログと完了ログを対応づける連番
  private val querySequence = AtomicInteger(0)

  override fun getName(): String = NAME

  /** 使用状況へのアクセスが現在許可されているかをReact Nativeへ返す */
  override fun isUsageAccessGranted(promise: Promise) {
    val granted = hasUsageAccess()
    logDebug("Permission check | usageAccessGranted=$granted")
    promise.resolve(granted)
  }

  /**
   * このアプリの使用状況アクセス設定を開く
   *
   * 端末がアプリ個別画面に対応していない場合は、使用状況アクセスの一覧画面を開く
   */
  override fun openUsageAccessSettings(promise: Promise) {
    try {
      val packageUri = "package:${reactContext.packageName}".toUri()
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS, packageUri).apply {
        // ReactApplicationContextはActivityではないため、新しいTaskとして画面を起動する
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }

      try {
        reactContext.startActivity(intent)
        logDebug("Opened the app-specific usage access settings")
      } catch (_: ActivityNotFoundException) {
        // 一部端末はpackage URI付きの個別設定画面を処理できないため、一覧画面へ戻す
        reactContext.startActivity(
          Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            // フォールバック側もReactApplicationContextから起動するため同じFlagが必要
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          },
        )
        logDebug("Opened the usage access settings list")
      }

      // TypeScriptのPromise<void>は、Native側ではnullをresolveして成功を表す
      promise.resolve(null)
    } catch (error: Exception) {
      logError("Unable to open usage access settings", error)
      promise.reject(ErrorCode.USAGE_SETTINGS, "Unable to open usage access settings", error)
    }
  }

  /**
   * 指定期間に端末全体で送受信したモバイル通信量をバイト単位で返す
   *
   * @param startTimeMillis Unix epochからのミリ秒で表す取得開始日時
   * @param endTimeMillis Unix epochからのミリ秒で表す取得終了日時
   * @param promise 合計バイト数、または[ErrorCode]のいずれかをReact Nativeへ返すPromise
   *
   * 非推奨警告は、端末全体の取得に必要なNetworkStatsの旧networkType APIに限定して抑制する
   */
  @Suppress("DEPRECATION")
  override fun getMobileUsageBytes(
    startTimeMillis: Double,
    endTimeMillis: Double,
    promise: Promise,
  ) {
    // このAPIでは1970年より前を受け付けず、終了日時は開始日時より後でなければならない
    if (startTimeMillis < 0 || endTimeMillis <= startTimeMillis) {
      logDebug(
        "Query rejected | invalid range | " +
          "start=${startTimeMillis.toLong()}, end=${endTimeMillis.toLong()}",
      )
      promise.reject(ErrorCode.INVALID_RANGE, "The requested usage period is invalid")
      return
    }

    // 権限なしで問い合わせるとSecurityExceptionになるため、時間のかかる処理の前に確認する
    if (!hasUsageAccess()) {
      promise.reject(ErrorCode.USAGE_ACCESS_REQUIRED, "Usage access has not been granted")
      return
    }

    val queryId = querySequence.incrementAndGet()
    logDebug(
      "Query #$queryId started | mobile | " +
        "${formatLogTime(startTimeMillis)} -> ${formatLogTime(endTimeMillis)}",
    )

    executor.execute {
      try {
        val networkStatsManager =
          reactContext.getSystemService(NetworkStatsManager::class.java)
            ?: throw IllegalStateException("NetworkStatsManager is unavailable")
        val bucket = networkStatsManager.querySummaryForDevice(
          ConnectivityManager.TYPE_MOBILE,
          null,
          startTimeMillis.toLong(),
          endTimeMillis.toLong(),
        )
        // 通信量として表示する値にはダウンロードとアップロードの両方を含める
        val totalBytes = bucket.rxBytes + bucket.txBytes

        val totalGb = String.format(Locale.ROOT, "%.2f", totalBytes / BYTES_PER_GB)
        logDebug("Query #$queryId completed | $totalGb GB | $totalBytes bytes")
        promise.resolve(totalBytes.toDouble())
      } catch (error: SecurityException) {
        logError("Query #$queryId failed | usage access unavailable", error)
        promise.reject(
          ErrorCode.USAGE_ACCESS_REQUIRED,
          "Usage access is required to retrieve mobile data usage",
          error,
        )
      } catch (error: Exception) {
        logError("Query #$queryId failed | unable to retrieve usage", error)
        promise.reject(ErrorCode.NETWORK_USAGE, "Unable to retrieve mobile data usage", error)
      }
    }
  }

  /** Native Moduleの破棄時に、このモジュールが所有するワーカースレッドも停止する */
  override fun invalidate() {
    executor.shutdownNow()
    super.invalidate()
  }

  /**
   * AndroidのAppOpsを参照し、PACKAGE_USAGE_STATSの特別なアクセス状態を確認する
   */
  private fun hasUsageAccess(): Boolean {
    // システムサービスを取得できない端末では、安全側に倒して未許可として扱う
    val appOpsManager =
      reactContext.getSystemService(AppOpsManager::class.java) ?: return false
    val mode = appOpsManager.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS,
      Process.myUid(),
      reactContext.packageName,
    )

    return mode == AppOpsManager.MODE_ALLOWED
  }

  /** Debugビルドでのみ、通信量取得の進行状況をLogcatへ出力する */
  private fun logDebug(message: String) {
    if (BuildConfig.DEBUG) {
      Log.d(LOG_TAG, message)
    }
  }

  /** Debugビルドでのみ、通信量取得の失敗理由を例外情報とともにLogcatへ出力する */
  private fun logError(message: String, error: Throwable) {
    if (BuildConfig.DEBUG) {
      Log.e(LOG_TAG, message, error)
    }
  }

  /** JavaScriptから渡されたUnix時刻を、端末のタイムゾーンで読める日時へ変換する */
  private fun formatLogTime(timestampMillis: Double): String =
    LOG_TIME_FORMATTER.format(
      Instant.ofEpochMilli(timestampMillis.toLong()).atZone(ZoneId.systemDefault()),
    )

  companion object {
    const val NAME = "NetworkUsage"
    private const val BYTES_PER_GB = 1_000_000_000.0
    private const val LOG_TAG = "NetworkUsage"
    private val LOG_TIME_FORMATTER =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z", Locale.ROOT)
  }

  /**
   * Promiseの失敗をJavaScript側で判定するためのerror code
   * AndroidのresultCodeに近い役割だが、`reject`した場合だけ使用する
   */
  private object ErrorCode {
    /** 使用状況へのアクセス設定画面を開けなかった */
    const val USAGE_SETTINGS = "E_USAGE_SETTINGS"

    /** 通信量を取得する開始・終了日時の指定が不正だった */
    const val INVALID_RANGE = "E_INVALID_RANGE"

    /** 使用状況へのアクセスが許可されていない、または取得中に取り消された */
    const val USAGE_ACCESS_REQUIRED = "E_USAGE_ACCESS_REQUIRED"

    /** NetworkStatsManagerによる通信量取得で、上記以外のエラーが発生した */
    const val NETWORK_USAGE = "E_NETWORK_USAGE"
  }
}
