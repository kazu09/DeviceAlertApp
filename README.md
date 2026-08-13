# DeviceAlertApp

React Native Community CLIで作成したモバイルアプリです。Expoは使用していません。

## 開発環境

- React Native 0.87.0
- React 19.2.3
- Node.js 24.19.0（nvmで管理）
- CocoaPods 1.16.2
- iOS 15.1以上
- Android minSdk 24 / targetSdk 36

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

## 参考資料

- [React Native documentation](https://reactnative.dev/docs/getting-started)
- [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment)
- [CocoaPods](https://cocoapods.org/)
