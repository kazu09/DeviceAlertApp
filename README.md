# DeviceAlertApp

React Native Community CLIで作成したモバイルアプリです。Expoは使用していません。

## 開発環境

- React Native 0.87.0
- React 19.2.3
- Node.js 24.19.0（nvmで管理）
- CocoaPods 1.16.2
- iOS 15.1以上
- Android minSdk 30 / targetSdk 36

Node.jsのバージョンはプロジェクト直下の`.nvmrc`で指定しています。nvmのユーザー共通デフォルトを変更する必要はありません。

## 初回セットアップ

リポジトリのルートで、プロジェクト指定のNode.jsへ切り替えて依存関係をインストールします。

```sh
nvm install
nvm use
npm ci
```

`nvm install`は`.nvmrc`のNode.jsが未導入の場合だけ必要です。導入済みなら`nvm use`だけで切り替えられます。

### iOS

XcodeとCocoaPodsが必要です。CocoaPodsが利用できることを確認します。

```sh
pod --version
```

初回セットアップ時、またはネイティブ依存関係を変更したときにPodsを更新します。

```sh
cd ios
pod install
cd ..
```

Xcodeで開く場合は、`ios/DeviceAlertApp.xcworkspace`を使用してください。

### Android

Android Studio、Android SDK、エミュレータが必要です。`android/local.properties`は各PC固有のSDKパスを指定するファイルなので、Gitにはコミットしません。

Android Studioではプロジェクト直下ではなく`android`フォルダを開いてください。Gradleは`scripts/node-with-nvm.sh`を通して`.nvmrc`で指定したNode.jsを使用するため、Node.jsをグローバルにインストールする必要はありません。

例：このPCの`Pixel_8`エミュレータを起動する場合

```sh
~/Library/Android/sdk/emulator/emulator @Pixel_8
```

## アプリの起動

Metroとアプリを別々のターミナルで起動すると、状態を把握しやすくなります。

ターミナル1：

```sh
nvm use
npm start
```

ターミナル2（iOS）：

```sh
nvm use
npm run ios -- --no-packager
```

特定のシミュレータを指定する場合：

```sh
npm run ios -- --simulator "iPhone 17 Pro" --no-packager
```

ターミナル2（Android）：

```sh
nvm use
npm run android -- --no-packager
```

Metroを自動起動させる場合は、`--no-packager`を付けずに`npm run ios`または`npm run android`を実行できます。

## モバイル通信量の取得

Androidでは、端末が記録したモバイル通信量を自動取得します。初回はホーム画面または設定画面の「設定を開く」を押し、Androidの設定でDeviceAlertAppの「使用状況へのアクセス」を許可してください。アプリへ戻ると自動で再取得します。

取得対象はモバイル回線のダウンロード量とアップロード量の合計です。Wi-Fi通信量は含みません。表示上の`1 GB`は`1,000,000,000 bytes`として換算しています。

画面ごとの集計期間は次のとおりです。

- ホームの合計：今月1日から現在まで
- ホームのグラフ：今日を含む直近7日間
- 履歴の日別：今月1日から今日まで
- 履歴の週別：今週を含む直近7週間（月曜始まり）
- 履歴の月別：今月を含む直近6か月

日別と月別の前月比、週別の前週比は、進行中の期間同士で条件を揃えるため同じ経過時点までを比較します。

エミュレータには通常モバイル回線の利用履歴がないため、通信量が`0 MB`と表示されても問題ありません。実際の通信量はAndroid実機で確認してください。端末側の集計値を使うため、通信事業者の請求画面とは集計期間や計測方法によって差が出ることがあります。

iOSではアプリから端末全体のモバイル通信量を取得できないため、現在は手動管理です。

### Androidの通信量取得ログ

Debugビルドでは、権限確認、取得期間、取得結果を`NetworkUsage`タグでLogcatへ出力します。リリースビルドでは出力しません。

Android StudioのLogcatでは、次のクエリで通信量取得ログだけに絞り込めます。

```text
tag:NetworkUsage
```

ターミナルから確認する場合は、接続中の端末IDを指定します。

```sh
adb devices
adb -s <device-id> logcat -s NetworkUsage
```

ログの`Query #1`のような番号は、非同期に実行される開始ログと完了ログを対応づけるためのものです。

## テストと静的解析

```sh
npm run lint
npm test
```

## トラブルシューティング

### 更新後にMetroのモジュール解決エラーが発生する

React Nativeや`node_modules`を更新したあと、更新前のMetroが残っていると、`AssetRegistry could not be found`などのエラーが発生することがあります。

起動中のMetroを`Ctrl+C`で停止し、キャッシュをリセットして再起動します。

```sh
nvm use
npm start -- --reset-cache
```

Metroがポート8081で動いているか確認する場合：

```sh
lsof -nP -iTCP:8081 -sTCP:LISTEN
```

### iOSの依存関係を更新した

```sh
cd ios
pod install
cd ..
```

### Fast Refreshで反映されない

Metroのターミナルで`r`を押すと、接続中のアプリをリロードできます。

### AndroidのNative Moduleを追加・変更した

Native ModuleのCodegen生成物が古い場合は、Androidのビルドを一度クリーンにしてから再起動します。

```sh
cd android
./gradlew clean
cd ..
npm run android -- --no-packager
```

## 参考資料

- [React Native documentation](https://reactnative.dev/docs/getting-started)
- [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment)
- [CocoaPods](https://cocoapods.org/)
