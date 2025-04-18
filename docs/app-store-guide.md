# App Store 配布準備ガイド

このドキュメントは、DailyFortuneアプリをApp Storeに配布するための準備手順をまとめたものです。

## 1. App Store Connect アカウント設定

### 1.1 Apple Developer Programへの登録

Apple Developer Programへの登録は年間99ドルが必要です。以下のステップで手続きを行います：

1. [Apple Developer Program](https://developer.apple.com/programs/)にアクセス
2. Apple IDでサインイン（ない場合は作成）
3. 「Enroll」をクリック
4. 個人または組織として登録するかを選択
   - 組織として登録する場合はD-U-N-S番号の取得が必要
5. 契約事項と利用規約に同意
6. 支払い情報を入力して登録完了

### 1.2 App Store Connectの設定

1. [App Store Connect](https://appstoreconnect.apple.com)にログイン
2. 「My Apps」を選択
3. 「+」ボタンをクリックし、「New App」を選択
4. アプリ情報を入力：
   - プラットフォーム: iOS
   - アプリ名: DailyFortune
   - プライマリ言語: 日本語
   - Bundle ID: jp.dailyfortune.app（Xcodeで設定したIDと一致する必要あり）
   - SKU: 一意の識別子（例：DAILYFORTUNE2025）
   - ユーザーアクセス：アクセス権を与えるチームメンバーを選択

## 2. スクリーンショットと素材の準備

### 2.1 必要なスクリーンショットサイズ

App Storeでは各デバイスサイズに合わせたスクリーンショットが必要です：

1. **iPhone**
   - 6.7インチ（iPhone 14 Pro Max等）: 1290 x 2796 px
   - 6.5インチ（iPhone 14 Plus等）: 1284 x 2778 px
   - 5.5インチ（iPhone 8 Plus等）: 1242 x 2208 px

2. **iPad**
   - 12.9インチiPad Pro: 2048 x 2732 px
   - 11インチiPad Pro: 1668 x 2388 px

各サイズで1〜10枚のスクリーンショットをアップロードできます。最低でも1つのデバイスタイプにつき1枚は必要です。

### 2.2 スクリーンショットの撮影方法

1. アプリをXcodeからシミュレータまたは実機で起動
2. キャプチャしたい画面に移動
3. 以下のいずれかの方法でキャプチャ：
   - シミュレータ: Command + S
   - 実機: 電源ボタン + 音量アップボタン

### 2.3 App Store用の最適化

スクリーンショットは単なるアプリ画面のキャプチャに留まらず、以下の工夫をすることでアプリのアピールポイントを強調できます：

1. キャプション付きデザイン（アプリの機能説明を追加）
2. デバイスフレーム内に表示
3. 特徴的な機能が分かる画面を選択
4. 視覚的に一貫性のあるデザイン

### 2.4 その他の必要素材

1. **アプリアイコン**: 1024 x 1024 px (透明部分なし、RGB色空間)
2. **プロモーションテキスト**: 170文字以内
3. **アプリプレビュー動画**: オプションだが、効果的なプロモーションになる

## 3. アプリ情報の記入

### 3.1 アプリ説明文

App Storeでのアプリ説明文は以下の要素を含むと効果的です：

1. **アプリの概要**: 簡潔で魅力的な説明（最初の2-3文が特に重要）
2. **主要機能**: 箇条書きで分かりやすく
3. **対象ユーザー**: 誰のためのアプリか
4. **利用メリット**: ユーザーが得られる価値
5. **更新情報**: バージョンアップの情報（アップデート時）

説明文は4,000文字まで入力可能ですが、簡潔で読みやすい文章にすることが重要です。

### 3.2 キーワードと検索最適化

アプリを見つけやすくするために、関連性の高いキーワードを設定します：

1. キーワードフィールド: カンマ区切りで100文字まで
2. 競合アプリの分析とキーワード研究
3. 検索結果で上位表示されるための工夫

### 3.3 カテゴリとレーティング設定

1. **プライマリカテゴリ**: ライフスタイル
2. **セカンダリカテゴリ**: エンターテイメント
3. **コンテンツレーティング**: アプリ内のコンテンツに基づいてレーティングを選択
   - 対象年齢層の設定
   - 不適切なコンテンツの有無の申告

## 4. 法的要件とプライバシー

### 4.1 プライバシーポリシー

アプリのプライバシーポリシーのURLを提供する必要があります。プライバシーポリシーには以下の情報を含める必要があります：

1. 収集するデータの種類
2. データの使用方法
3. データの保存とセキュリティ
4. ユーザーの権利と選択肢
5. ポリシーの変更に関する通知方法

### 4.2 App Review情報

1. 連絡先情報: レビュアーからの質問に対応できる担当者の情報
2. デモアカウント: 必要に応じてレビュー用のアカウント情報を提供
3. 追加情報: アプリの正確な評価に役立つ情報

## 5. 価格と可用性

### 5.1 価格設定

1. 無料または有料アプリの選択
2. 有料の場合は価格帯と価格ティア
3. App内課金の設定（必要な場合）

### 5.2 配信国・地域

アプリを配信する国と地域を選択します。デフォルトではすべての地域が選択されています。

### 5.3 配信日設定

1. 審査完了後すぐに公開
2. 手動で公開日を設定
3. 事前注文の設定（マーケティング用）

## 6. ビルドのアップロードと配信

### 6.1 最終ビルドの生成

1. Xcodeでリリース用設定を確認
2. アーカイブを作成（Product > Archive）
3. コード署名の確認

### 6.2 TestFlightテスト

リリース前にTestFlightでテストを行うことをお勧めします：

1. 内部テスターグループの設定
2. 外部テスターグループの設定（必要に応じて）
3. フィードバックの収集と重要な問題の修正

### 6.3 App Storeへの提出

1. App Store Connectでビルドの提出を選択
2. 必要な情報がすべて入力されていることを確認
3. 「Submit for Review」ボタンをクリック

### 6.4 審査プロセス

1. 審査提出: 平均的に24〜48時間
2. 審査中のステータス確認
3. 拒否された場合の対応策
4. 承認後の公開設定

## 7. アカウント・権限管理（チーム開発の場合）

### 7.1 ユーザーロールと権限

1. Admin: すべての権限を持つ
2. App Manager: アプリの管理
3. Developer: 開発とテスト
4. Marketing: アプリのマーケティング情報管理
5. Sales: 財務と販売レポートへのアクセス

### 7.2 チームメンバー追加手順

1. App Store Connectのユーザーとアクセスセクションへ移動
2. 「+」ボタンをクリック
3. メールアドレス、名前、役割を入力して招待

## 8. 審査対策と準備

### 8.1 審査に通りやすくするためのチェックリスト

1. App Storeレビューガイドラインに準拠しているか
2. クラッシュやバグがないか
3. 説明と機能が一致しているか
4. プライバシーに関する情報が正確か
5. 使用されていない機能や未完成の機能がないか

### 8.2 よくある拒否理由と対策

1. クラッシュや技術的な問題
2. 不完全または誤解を招く情報
3. 不十分なユーザー体験
4. プライバシーポリシーの問題
5. アプリ内課金の問題

## 9. リリース後の管理

### 9.1 アナリティクスとモニタリング

1. App Store Connectのアナリティクス機能
2. サードパーティのアナリティクスツール
3. クラッシュレポートの監視

### 9.2 アップデート管理

1. 定期的な更新とバグ修正
2. 機能追加とエンハンスメント
3. ユーザーフィードバックへの対応

### 9.3 レビュー管理

1. ユーザーレビューの監視
2. レビューへの返信
3. ネガティブなフィードバックへの対処

## 10. 参考リソース

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [TestFlight Beta Testing](https://developer.apple.com/testflight/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

---

本ドキュメントは定期的に更新されます。最新のAppleのポリシーやガイドラインを必ず確認してください。