# DailyFortuneネイティブアプリ移行チェックリスト

## 初期設定・環境構築
- [x] 1. 新規プロジェクト作成 (`DailyFortune-Native`)
- [x] 2. 不要ファイル削除 (.git, node_modules など)
- [x] 3. Git リポジトリ初期化
- [x] 4. package.json の名前を `dailyfortune-native` に更新
- [x] 5. README と関連ドキュメントの更新

## Capacitor導入
- [x] 6. Capacitor Core と CLI をインストール
- [x] 7. Capacitor プロジェクト初期化 (`npx cap init`)
- [x] 8. vite.config.ts の base を `'./'` に変更
- [x] 9. Capacitor Preferences パッケージをインストール
- [x] 10. npm run build の実行
- [x] 11. Android プラットフォーム追加 (`npx cap add android`)
- [x] 12. iOS プラットフォーム追加 (`npx cap add ios`)
- [x] 13. capacitor.config.ts の設定

## API設定と環境変数
- [x] 14. 本番環境用API URL設定
- [x] 15. API通信のHTTPS強制対応
- [x] 16. バックエンドのCORS設定確認・調整

## ストレージシステム実装
- [x] 17. IStorageService インターフェース作成
- [x] 18. CapacitorStorageService 実装 (Preferences 使用)
- [x] 19. WebStorageService 実装 (localStorage バックアップ)
- [x] 20. プラットフォーム検出ロジック実装

## 認証システム対応
- [x] 21. token.service.ts の非同期対応
- [x] 22. AuthContext の非同期対応
- [x] 23. ローディング状態の適切な管理実装
- [x] 24. 認証関連の全コンポーネント更新
  - [x] 24.1. ログイン関連画面（Register, ForgotPassword）
  - [x] 24.2. ユーザーメニュー・ナビゲーション（UserMenu, NavigationMenu）
  - [x] 24.3. プロファイル関連コンポーネント（SajuProfileModal, SajuProfileSection）
  - [x] 24.4. チーム関連コンポーネント（Team pages）
  - [x] 24.5. その他認証利用コンポーネント（Fortune, Chat）
  - [x] 24.6. auth-manager.service.ts の非同期対応  
- [x] 25. JWT更新ロジックの非同期対応
- [x] 26. ログイン・ログアウトフローのテスト
- [x] 27. セッション管理の最適化

## ネットワーク監視実装
- [x] 28. NetworkMonitorService の作成
- [x] 29. プラットフォーム別ネットワーク検出実装
- [x] 30. ネットワーク状態表示コンポーネント作成
- [x] 31. オフライン状態時の UI フィードバック実装

## APIサービスのオフライン対応 (基本)
- [x] 32. GET リクエストのキャッシュシステム実装
- [x] 33. キャッシュのタイムスタンプと有効期限管理
- [x] 34. キャッシュのクリア機能実装
- [x] 35. オフライン読み取り時のキャッシュフォールバック実装
- [x] 36. オンライン復帰時のキャッシュ再検証ロジック

## 基本UI/UXの調整（限定テスト版用）
- [x] 37. スプラッシュスクリーン設定
- [x] 38. アプリアイコン設定
- [x] 39. 基本的なレイアウト調整（最小限）
- [x] 40. ナビゲーション基本機能確認

※ 詳細なUI/UX最適化は限定テスト版フィードバック後に実施

## プラットフォーム固有設定
- [x] 46. Android マニフェスト設定（権限など）
- [x] 47. iOS Info.plist 設定（権限など）
- [x] 48. Android アイコンセット準備（各解像度）
- [x] 49. iOS アイコンセット準備（各解像度）
- [x] 50. Android スプラッシュ画像準備
- [x] 51. iOS スプラッシュ画像準備
- [x] 52. Android キーボード設定
- [x] 53. iOS キーボード設定

## アプリ基本機能実装
- [x] 54. バックボタン処理の実装
- [x] 55. アプリ終了処理の実装
- [x] 56. ディープリンク基本設定
- [x] 57. スクリーン方向設定（縦横）
- [x] 58. App.tsx のライフサイクル処理調整
- [x] 59. エラーバウンダリの実装
- [x] 60. クラッシュレポート基本設定

## ビルド設定
- [x] 61. Android ビルド設定（build.gradle）
- [x] 62. iOS ビルド設定（Xcode project）
- [x] 63. Android リリース用署名Keystore作成
- [x] 64. iOS 証明書とプロビジョニングプロファイル設定
- [x] 65. ビルド環境変数の設定
- [x] 66. ビルドスクリプト作成

## ビルド設定とデバッグビルド（限定テスト版用）
- [x] 67. バージョン番号と識別子の設定
- [x] 68. TestFlight の設定 (iOS)
- [x] 69. Firebase App Distribution の設定 (Android)
- [x] 70. デバッグビルドAPIエンドポイント設定
- [x] 70a. APIエンドポイントの動作検証とテスト
- [x] 71. Android デバッグビルド生成と配布
- [x] 72. iOS デバッグビルド生成と配布
- [x] 73. テスター向け簡易ガイド作成

## 認証システム改善（リファクタリング）
- [ ] 115. 認証関連サービスの直接リダイレクト処理削除
- [ ] 116. AuthContextのユーザー情報管理とユーザーID整合性チェック実装 
- [ ] 117. ログイン/ログアウトフローの改善（リダイレクトループ解消）
- [ ] 118. ナビゲーション方法の統一（React Routerベース）

## 限定テストとフィードバック
- [ ] 74. 基本機能の動作確認テスト
- [ ] 75. オフライン⇔オンライン切り替えテスト
- [ ] 76. ローカルストレージの動作確認
- [ ] 77. 実機でのUI/UXフィードバック収集
- [ ] 78. 複数デバイスでのレイアウト確認
- [ ] 79. バグ報告とクラッシュレポート分析

## UI/UXの詳細最適化（フィードバック後）
- [ ] 80. ボタンサイズとタッチターゲット拡大
- [ ] 81. フォントサイズと余白の調整
- [ ] 82. スクロール動作の最適化
- [ ] 83. フォーム入力のモバイル最適化
- [ ] 84. キーボード表示時のUI調整
- [ ] 85. ナビゲーションの最適化（スワイプ操作等）
- [ ] 86. モバイル向けローディングインジケーター調整

## 一般配布準備
- [~] 87. App Store Connect アカウント設定
- [~] 88. Google Play Console アカウント設定
- [ ] 89. App Storeスクリーンショット準備（各デバイスサイズ）
- [ ] 90. Google Playスクリーンショット準備（各デバイスサイズ）
- [ ] 91. アプリ説明文の準備
- [ ] 92. プライバシーポリシーの調整
- [ ] 93. アプリのカテゴリとレーティング設定
- [ ] 94. リリース用APIエンドポイント設定
- [ ] 95. デバッグコードの削除

## 一般公開リリース
- [ ] 96. Android リリースビルド生成
- [ ] 97. iOS リリースビルド生成
- [ ] 98. リリースビルドの最終動作確認

## 一般公開前の最終確認
- [ ] 99. アプリ起動・終了サイクルテスト
- [ ] 100. メモリ使用量チェック
- [ ] 101. バッテリー消費テスト
- [ ] 102. 初回起動時の動作確認
- [ ] 103. アプリ再インストール後の動作確認
- [ ] 104. すべての主要機能の最終確認
- [ ] 105. 設定・環境値の最終確認

## 一般配布とモニタリング
- [ ] 106. App Storeへの提出
- [ ] 107. Google Playへの提出
- [ ] 108. レビュープロセスの監視
- [ ] 109. 初期ユーザーフィードバックの収集準備

## CI/CD（オプション）
- [ ] 110. GitHub Actions ワークフロー設定
- [ ] 111. 自動ビルドの設定
- [ ] 112. 自動テストの設定
- [ ] 113. テスト配布の自動化

# 更新ルール

1. タスク完了時：
   - タスク番号の横にある `[ ]` を `[x]` に変更
   - 完了したタスクに関するエラーログがあれば削除
   - 進捗管理セクションの完了タスク数と進捗率を更新
   - 最終更新日を更新

2. エラー発生時：
   - エラー引き継ぎログに構造化された情報を追加
   - 参考資料があればリンクを追加

3. タスク開始時：
   - 着手中のタスクを明示するため `[ ]` を `[~]` に変更（任意）

## 進捗管理
- 完了タスク数: 66/118
- 進捗率: 55.93%
- 最終更新日: 2025/4/19 14:40

## 開発コマンド集

### TypeScriptエラーチェック
```bash
# TypeScriptコンパイルエラーチェック（コード生成なし）
cd client && npx tsc --noEmit

# プロジェクトビルド（エラーチェック込み）
cd client && npm run build
```

### アプリ起動
```bash
# 開発サーバー起動（ローカルのみ）
cd client && npm run dev

# 開発サーバー起動（外部アクセス可能）
cd client && npm run dev -- --host

# iOS向けビルドと同期
cd client && npm run build && npx cap sync ios

# Android向けビルドと同期
cd client && npm run build && npx cap sync android
```

### テスト実行
```bash
# ネイティブプロジェクトをXcodeで開く
cd client && npx cap open ios

# ネイティブプロジェクトをAndroid Studioで開く
cd client && npx cap open android
```

## 参考資料リンク

- [ネイティブアプリ実装ガイド](/docs/native-app-implementation-guide.md) - Capacitorを使った実装の詳細ガイド
- [ネイティブアプリ移行計画](/docs/native-app-migration-plan.md) - 移行全体の計画書
- [Capacitor公式ドキュメント](https://capacitorjs.com/docs) - Capacitorの公式リファレンス
- [Vite+React+TypeScript構成](https://vitejs.dev/guide/) - ビルド設定の参考
- [Android ビルドガイド](/client/android-build-guide.md) - Android Studio でのビルド手順
- [Capacitor HTTP Plugin](https://capacitorjs.com/docs/apis/http) - ネイティブHTTPリクエスト実装
- [Firebase App Distribution](https://firebase.google.com/docs/app-distribution) - テスト版配布システム

## 環境変数管理ルール

APIエンドポイントのURLパス重複問題を防ぐため、以下のルールを厳守してください。

### 環境変数設定ルール（重要）

1. **APIベースURLの設定**
   - `VITE_API_URL` には **絶対に** `/api/v1` を含めないこと
   - 末尾のスラッシュ（`/`）も含めないこと
   - 正しい例: `https://dailyfortune-api-6clpzmy5pa-an.a.run.app`
   - 誤った例: `https://dailyfortune-api-6clpzmy5pa-an.a.run.app/api/v1` または `https://dailyfortune-api-6clpzmy5pa-an.a.run.app/`

2. **APIパスの構築方法**
   - すべてのAPIパスは `shared/index.ts` で定義された定数を使用すること
   - 直接文字列でパスを書かないこと（例: `/api/v1/auth/login` ではなく `AUTH.LOGIN` を使用）
   - URL構築時には必ず重複チェックを行うこと

3. **環境変数の統一**
   - すべての環境（開発、本番、デバッグ）で同じ形式の環境変数を使用すること
   - ローカル、Web、ネイティブアプリで環境変数の構造を一致させること

4. **環境変数変更時のチェックリスト**
   - 変更後、パスの重複が発生していないか確認
   - `shared/index.ts` との整合性を確認
   - すべての環境で同じURL構築ロジックが使用されているか確認
   - 関連ドキュメント（`deploy.md`など）も更新

### URL構築のベストプラクティス

以下の関数を `common/url-utils.ts` などに実装して、すべてのサービスで共有することを推奨します：

```typescript
/**
 * API URLを安全に構築するユーティリティ関数
 * パスの重複を検出して修正します
 * 
 * @param apiPath shared/index.tsで定義されたAPIパス（通常は/api/v1で始まる）
 * @param baseUrl オプション。環境変数から取得したベースURL。指定がない場合はVITE_API_URLを使用
 * @returns 完全に構築されたURL
 */
export function buildApiUrl(apiPath: string, baseUrl?: string): string {
  // 環境変数から取得したベースURL（末尾スラッシュなし）
  const envBaseUrl = import.meta.env.VITE_API_URL || '';
  const baseURL = (baseUrl || envBaseUrl).replace(/\/$/, '');
  
  // APIパスのチェックと正規化
  if (!apiPath) {
    console.error('APIパスが指定されていません');
    return baseURL;
  }
  
  // APIパスから二重パスを防止（/api/v1が重複する場合は修正）
  let cleanPath = apiPath;
  
  // 重複パターンの検出
  const duplicatePatterns = [
    { pattern: '/api/v1/api/v1', fix: '/api/v1' },
    { pattern: '/api/v1', base: '/api/v1', condition: (url: string) => url.endsWith('/api/v1') }
  ];
  
  // パス重複チェック - baseURLが/api/v1で終わり、apiPathが/api/v1で始まる場合
  if (baseURL.endsWith('/api/v1') && apiPath.startsWith('/api/v1')) {
    cleanPath = apiPath.replace('/api/v1', '');
    console.warn(`⚠️ URLパス重複を検出: ${baseURL + apiPath}`);
    console.warn(`🔧 修正後のURL: ${baseURL + cleanPath}`);
  }
  
  // pathの二重スラッシュを修正
  const finalUrl = (baseURL + cleanPath).replace(/([^:]\/)\/+/g, '$1');
  
  // デバッグモードの場合は完全なURLを出力
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_ENABLED === 'true') {
    console.log(`🔗 API URL: ${finalUrl}`);
  }
  
  return finalUrl;
}
```

この関数をすべてのサービスで使用することで、URL構築を一元化し、パス重複問題を防ぐことができます。

## エラー引き継ぎログ

このセクションには、タスク実行中に発生した問題とその解決策を記録します。タスクが完了したら、そのタスクに関するログは削除して構いません。

### 記録形式

```
【タスク番号】タスク名
- 問題：遭遇した問題の詳細
- 試行：試行した解決策
- 結果：成功または失敗、部分的な成功
- 解決策：最終的な解決策または回避策
- メモ：引き継ぎに必要な追加情報
- 参考：関連する参考資料へのリンク（任意）
```

### 現在のエラーログ

【70a】APIエンドポイントの問題修正（完了）
- 問題：APIエンドポイントのパスに「/api/v1」が重複していた
  - 例：`https://dailyfortune-api-6clpzmy5pa-an.a.run.app/api/v1/api/v1/jwt-auth/refresh-token`
- 原因分析：
  1. shared/index.tsのAPI定数には既に/api/v1が含まれている
  2. 環境変数VITE_API_URLにも/api/v1が含まれていた
  3. これらを結合して使用していたため、パスが重複していた
- 解決策：
  1. 環境変数から/api/v1を除去（`.env.production`と`.env.debug`）
  2. 各サービスで重複検出・修正ロジックを実装（jwt-auth.service.ts, chat.service.ts）
  3. api.service.tsのログ出力を改善し、問題を明確に表示
- 実施した修正：
  1. 環境変数からパスを削除：`VITE_API_URL=https://dailyfortune-api-6clpzmy5pa-an.a.run.app`
  2. 重複検出ロジック追加：`if (baseURL.includes('/api/v1')) { cleanBaseUrl = baseURL.replace('/api/v1', ''); }`
  3. APIサービス情報ログの強化：より詳細な情報表示と警告メッセージ

【74-78】四柱推命プロフィール設定後のUX改善（完了）
- 問題：新規ユーザー登録後、四柱推命プロフィール入力完了後にモーダルが閉じず、再度表示される問題
- 原因分析：
  1. RequireSajuProfile.tsxのhandleProfileComplete関数でwindow.location.reloadを呼び出している
  2. リロード後に再度プロフィールチェックが走り、処理が重複している
  3. useEffectの条件判定が不適切で、userProfileが更新されるたびにチェックが再実行される 
  4. 実際にはプロフィール情報は正常に保存されているが、UI/UXが不適切
- 解決策：
  1. window.location.reloadをnavigateに変更
  2. navigate('/fortune')でフォーチュンページに直接遷移するよう修正
  3. useEffectの先頭に早期リターン条件「if (profileChecked) return;」を追加
  4. useEffect内の条件判定を簡略化してプロファイルチェックロジックを明確化
- タスク：
  - [x] RequireSajuProfile.tsxの修正
  - [ ] 四柱推命プロフィール設定完了時のユーザーフィードバック強化
  - [ ] プロフィール情報更新時のキャッシュ管理改善
  - [ ] AuthContextのuserProfileステート更新タイミングの最適化
  - [ ] ユーザーオンボーディングフローの全体的なUX見直し

【115-118】認証システム改善（計画中）
- 問題：ログイン認証に関する複数の問題
  1. ログインすると複数のクエリパラメータとハッシュが付与されたURLが生成される
  2. ユーザーID混同(metavicer3でログインしてもlennon@gmail.comの情報が表示される)
  3. ログアウト後に無限リダイレクトループが発生
- 原因分析:
  1. 直接 window.location.href を使用したリダイレクト処理と React Router が混在
  2. ログイン成功後に手動で currentUser の設定をしており、実際のAPI応答と不整合
  3. ログアウト後の画面遷移が明示的に実装されていない
- 対応計画:
  1. 認証関連サービスから直接のリダイレクト処理を削除
  2. AuthContextのユーザー情報管理を改善し、整合性チェックを導入
  3. ログイン/ログアウトフローの改善とリダイレクト方法の統一
- タスク:
  - [ ] jwt-auth.service.ts からリダイレクト処理を削除
  - [ ] ユーザーIDの整合性検証の導入
  - [ ] React Router ベースでのリダイレクト統一
  - [ ] ログアウト処理後の明示的な画面遷移実装

【68】TestFlight の設定 (iOS) - 完了
- 状況：TestFlightの設定完了、ビルド処理中
- 実施内容：
  1. App Store Connectでのアプリ登録完了
  2. チーム「MIKOTO, K.K.」での開発用証明書とプロビジョニングプロファイル設定
  3. Xcodeでアーカイブを作成しApp Store Connectにアップロード
- 次のステップ：
  1. ビルド処理完了後、テスターグループを作成
  2. テスターの招待とフィードバック収集
- 参考：App Storeガイド（docs/app-store-guide.md）の6.2セクション

【73】テスター向け簡易ガイド作成
- 状況：Androidビルド完了、iOSビルド準備中の段階でテスター向けガイド作成
- 作成した文書：
  1. 一般的なテスターガイド（tester-guide.md）
  2. Android版専用ガイド（tester-guide-android.md）
  3. iOS版専用ガイド（tester-guide-ios.md）
  4. テストチェックリスト（tester-guide-checklist.md）
- 内容：
  1. インストール手順
  2. 基本操作ガイド
  3. テスト観点と重点項目
  4. バグ報告方法
  5. トラブルシューティング
- 次のステップ：
  1. テスター招待と配布準備
  2. テスターフィードバック収集方法の確立