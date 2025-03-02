# kindle_to_notion

Kindle のハイライトを Notion に簡単に保存できる Chrome 拡張機能です。

## 機能

- Kindle のハイライトを Notion のデータベースに保存
- 本のタイトルと著者の自動取得
- コメントの追加
- タグの設定（マルチセレクト）
- 保存完了時のトースト通知

## セットアップ

1. Notion インテグレーションの作成
   - [Notion Developers](https://developers.notion.com/) にアクセス
   - 新しいインテグレーションを作成
   - インテグレーションのシークレットキーをコピー

2. Notion データベースの準備
   - 新しいデータベースを作成
   - 以下のプロパティを設定:
     - Highlight (タイトル)
     - Created At (日付)
     - Comment (テキスト)
     - Book Title (セレクト)
     - Author (セレクト)
     - Tags (マルチセレクト)
   - データベースをインテグレーションと共有

3. 拡張機能の設定
   - 拡張機能のアイコンをクリック
   - Notion API キーとデータベース ID を入力
   - 「接続テスト」ボタンで設定を確認

## 使い方

1. Kindle のハイライトページ（https://read.amazon.co.jp/notebook）を開く
2. 各ハイライトの横に表示される「Notion にコピー」ボタンをクリック
3. コメントを入力（任意）
4. タグを選択（任意）
5. 「確認」をクリックして保存

## 開発者向け情報

### プロジェクト構成

```
kindle_to_notion/
├── manifest.json        # 拡張機能の設定
├── background.js       # バックグラウンドスクリプト
├── content.js         # コンテンツスクリプト
├── popup.html         # 設定画面のHTML
└── popup.js          # 設定画面のスクリプト
```

### ビルド方法

1. リポジトリをクローン
2. Chrome の拡張機能管理ページを開く
3. 「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. プロジェクトのディレクトリを選択

### コーディング規約

- 関数名: camelCase
- 変数名: snake_case
- 最大行長: 100文字
- インデント: スペース
- すべての関数にドキュメント文字列を付ける

## ライセンス

MIT License

## 参考

https://note.com/liguria/n/n15e98f14fb9a