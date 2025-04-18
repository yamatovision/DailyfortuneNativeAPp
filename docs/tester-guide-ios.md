# DailyFortune iOS版テスターガイド

## インストール手順

### TestFlightを使用したインストール

1. **招待メールの確認**
   - 開発チームから送信されたTestFlight招待メールを確認します
   - メール内の「View in TestFlight」または「TestFlightで表示」ボタンをタップします

2. **TestFlightアプリのインストール**
   - App Storeから[TestFlight](https://apps.apple.com/jp/app/testflight/id899247664)アプリをインストールします（まだインストールしていない場合）
   - TestFlightアプリを開きます

3. **TestFlightからDailyFortuneのインストール**
   - TestFlightのマイアプリ画面に「DailyFortune」が表示されます
   - 「インストール」ボタンをタップしてアプリをインストールします
   - インストール完了後、TestFlightから直接アプリを起動できます

4. **ビルドの更新確認**
   - テスト期間中に新しいビルドがリリースされた場合、TestFlightアプリに通知が表示されます
   - 常に最新バージョンでテストを行うよう、更新をお願いします

## ログインとプロファイル設定

1. **アプリ起動とログイン**
   - アプリを起動し、ログイン画面が表示されるのを確認します
   - テスト用アカウントか、新規アカウントでログインします
     - テスト用アカウント情報: [テスト用アカウント情報]
     - 新規アカウント: 「新規登録」をタップして必要情報を入力

2. **四柱推命プロファイル設定**
   - 初回ログイン時、プロファイル設定画面が表示されます
   - 生年月日、出生時刻、出生地情報を入力します
   - 国際タイムゾーンにも対応していますので、海外の出生地も設定可能です

## テスト観点とチェックポイント

### 1. iOS特有の機能確認

- **Face ID/Touch ID対応**:
  - アプリロック機能でのFace ID/Touch IDの動作確認（設定で有効化が必要）

- **画面サイズ対応**:
  - 異なるiPhone画面サイズでの表示確認
  - iPadでの表示確認（対応している場合）
  - ノッチやダイナミックアイランドのあるデバイスでの表示確認

- **ダークモード対応**:
  - iOS設定でダークモードに切り替えた際の表示確認

### 2. ネットワーク状態の切り替え

- **オンライン/オフライン切替のテスト方法**:
  - コントロールセンターからWi-Fiとモバイルデータをオフにして動作確認
  - Wi-Fiのみ、モバイルデータのみの状態での動作確認
  - 不安定なネットワーク環境下での動作確認（接続の弱い場所など）

- **確認すべき点**:
  - オフライン時のエラーメッセージが適切に表示されるか
  - オフライン→オンラインの切り替え時にデータが自動更新されるか
  - キャッシュデータが適切に表示されるか

### 3. 運勢表示機能

- **デイリー運勢表示**:
  - 朝、日中、夜など異なる時間帯でアプリを開き、運勢が更新されるか確認
  - 運勢詳細ページの表示内容や操作性を確認

- **ラッキーアイテム**:
  - ラッキーアイテムの表示が適切か
  - アイテムの説明文の可読性やレイアウトを確認

### 4. チーム機能

- **チーム表示と管理**:
  - チームリストの表示確認
  - チームメンバーの表示確認
  - チーム相性分析の動作確認

### 5. チャット機能

- **メッセージ送受信**:
  - テキスト入力と送信の動作確認
  - メッセージ履歴の表示確認
  - 長文メッセージの表示確認

### 6. UI/UXのテスト

- **ジェスチャー操作**:
  - スワイプ、タップ、長押し等のジェスチャー動作確認
  - 戻るジェスチャー（画面左端からのスワイプ）の動作確認

- **キーボード操作**:
  - フォーム入力時のキーボード表示と動作確認
  - フォーム間の移動がスムーズか
  - キーボード表示時のUI調整が適切か

### 7. パフォーマンステスト

- **アプリの応答性**:
  - 起動時間の計測
  - 画面遷移の速度確認
  - データ読み込み時のローディング表示確認

- **バッテリー消費**:
  - 設定 > バッテリーでのアプリのバッテリー使用状況確認
  - バックグラウンド実行時のバッテリー消費確認

### 8. アプリライフサイクル

- **バックグラウンド/フォアグラウンド切り替え**:
  - ホームに戻った後、再度アプリを開いた際の状態保持確認
  - 他のアプリを使用した後の復帰動作確認

- **アプリの強制終了と再開**:
  - アプリスイッチャーからアプリを閉じ、再度開いた際の動作確認

## バグ報告の方法

バグや不具合を発見した場合は、以下の情報を含めて報告してください：

1. **デバイス情報**
   - デバイス名（例：iPhone 15 Pro, iPad Air 5など）
   - iOSバージョン
   - アプリのバージョン（TestFlightに表示されるバージョン）

2. **問題の詳細**
   - 何をしようとしていたか
   - 発生した問題の詳細
   - 再現手順（できるだけ詳細に）
   - 期待される動作と実際の動作の違い

3. **スクリーンショット/動画**
   - 可能であれば、問題が発生した画面のスクリーンショットや画面収録を添付
   - iOSではコントロールセンターから画面収録が可能です

4. **報告方法**
   - TestFlightアプリ内のフィードバック機能（アプリ内でスクリーンショットを撮ると自動的にフィードバック画面が表示されます）
   - メール: [テスト担当者のメールアドレス]
   - Slack: #dailyfortune-テスターチャンネル

## よくある問題と解決方法

### インストール時の問題

- **TestFlightの招待が確認できない**
  - 迷惑メールフォルダを確認
  - Apple IDが招待メールと同じアドレスであることを確認

- **インストールボタンがグレーアウトしている**
  - デバイスのiOSバージョンがアプリの最小要件を満たしているか確認
  - 十分な空き容量があるか確認

### アプリ使用中の問題

- **ログインできない**
  - ネットワーク接続を確認
  - アカウント情報が正確か確認
  - アプリを再起動して再試行

- **クラッシュが発生する**
  - アプリを完全に閉じて再起動（アプリスイッチャーから上にスワイプ）
  - デバイスを再起動
  - TestFlightで最新バージョンを使用しているか確認

## フィードバック提供のお願い

テスト中に気づいた点（良い点も改善点も）を積極的にお知らせください。特に以下の観点でのフィードバックを歓迎します：

- iOS特有の機能との統合性
- Human Interface Guidelinesへの適合性
- 使いやすさ
- デザインの印象
- 機能の有用性
- 改善アイデア

ご協力ありがとうございます！