# Mastra Sample - AI Agents with Gemini

Mastraフレームワークを使用したAIエージェントのサンプルプロジェクト。Google Geminiの無料APIとTavily検索APIを使用しています。

## セットアップ

### 1. Google AI Studio APIキーの取得（無料）

1. [Google AI Studio](https://aistudio.google.com/apikey) にアクセス
2. Googleアカウントでログイン
3. "Get API key" または "Create API key" をクリック
4. APIキーをコピー

### 2. Tavily API キーの取得（無料）

**リサーチアシスタント機能を使用する場合のみ必要**

1. [Tavily](https://tavily.com) にアクセス
2. "Get API Key" をクリックしてアカウント作成
3. 無料プラン（1,000リクエスト/月）を選択
4. APIキーをコピー

### 3. 環境変数の設定

```bash
# .envファイルを作成
cp .env.example .env

# .envファイルを編集してAPIキーを設定
# GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key-here
# TAVILY_API_KEY=your-tavily-api-key-here  # リサーチアシスタント用（オプション）
```

### 4. 依存関係のインストール

```bash
npm install
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

## 使用しているモデル

- **メインエージェント**: `google/gemini-2.5-flash-lite`（無料）
- **評価スコアラー**: `google/gemini-2.5-flash-lite`（無料）

Gemini 2.5 Flash Liteは軽量版で、レート制限が緩く、高速で効率的なモデルです。

## 実装されているエージェント

### 1. Weather Agent（天気エージェント）
- 天気情報の取得
- 場所名の自動翻訳
- 天気に基づいたアクティビティ提案

### 2. Code Reviewer Agent（コードレビューエージェント）
- ファイルの読み込みとコードレビュー
- セキュリティ脆弱性の検出
- パフォーマンス改善提案
- ベストプラクティスの評価

### 3. Research Assistant（リサーチアシスタント）
- Web検索による情報収集
- 複数ソースからの情報統合
- 引用付きレポート生成
- ソースの信頼性評価

### 4. Task Orchestrator（タスクオーケストレーター）⭐新機能
- 議事録からアクションアイテムを自動抽出
- タスクの分類と優先度付け
- 適切なエージェント/ツールの自動選択
- タスクの実行と結果の集約
- 進捗レポートの自動生成

**使用例：**
```
議事録を読み込んで：
"来週までにAIエージェントのトレンドを調査。src/agents/のコードをレビューして改善点を提案。"

→ 自動実行：
1. リサーチアシスタントでトレンド調査
2. コードレビューエージェントでコードレビュー
3. 結果を統合レポートとして出力
```

## プロジェクト構成

```
src/mastra/
├── index.ts              # Mastraの設定
├── agents/
│   └── weather-agent.ts  # 天気エージェント（Gemini使用）
├── tools/
│   └── weather-tool.ts   # 天気API連携ツール
├── workflows/
│   └── weather-workflow.ts # ワークフロー定義
└── scorers/
    └── weather-scorer.ts # 評価スコアラー（Gemini使用）
```

## コマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバー起動

## 注意事項

- Geminiの無料枠には制限があります（詳細は[Google AI Studio](https://ai.google.dev/pricing)を確認）
- APIキーは`.env`ファイルに保存し、Gitにはコミットしないでください（`.gitignore`で除外済み）

## その他のモデルオプション

Mastraは以下のモデルもサポートしています：

- `google/gemini-2.5-flash-lite` - 軽量版（無料・推奨）
- `google/gemini-2.5-flash` - 標準版（無料だがレート制限あり）
- `google/gemini-2.0-flash` - 前世代（無料）

**推奨**: 安定した無料利用には`google/gemini-2.5-flash-lite`がおすすめです。
**注意**: Gemini 1.5シリーズは廃止されました。2.5以降を使用してください。

**注意**: Googleは定期的にモデルを更新します。最新の利用可能なモデルは[Google AI Studio](https://ai.google.dev/gemini-api/docs/models)で確認できます。

モデルを変更するには、`src/mastra/agents/weather-agent.ts`と`src/mastra/scorers/weather-scorer.ts`の`model`フィールドを編集してください。
