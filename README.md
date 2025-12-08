# Mastra Sample - Weather Agent with Gemini

Mastraフレームワークを使用した天気情報エージェントのサンプルプロジェクト。Google Geminiの無料APIを使用しています。

## セットアップ

### 1. Google AI Studio APIキーの取得（無料）

1. [Google AI Studio](https://aistudio.google.com/apikey) にアクセス
2. Googleアカウントでログイン
3. "Get API key" または "Create API key" をクリック
4. APIキーをコピー

### 2. 環境変数の設定

```bash
# .envファイルを作成
cp .env.example .env

# .envファイルを編集してAPIキーを設定
# GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key-here
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

## 使用しているモデル

- **メインエージェント**: `google/gemini-flash-latest`（無料）
- **評価スコアラー**: `google/gemini-flash-latest`（無料）

Gemini Flash Latestは安定した無料枠があり、高速で効率的なモデルです。

## 機能

- 天気情報の取得
- 場所名の自動翻訳
- 天気に基づいたアクティビティ提案
- AIによる応答品質の評価

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

- `google/gemini-flash-latest` - 最新のFlash版（無料・推奨）
- `google/gemini-pro-latest` - より高性能（無料枠あり、制限付き）
- `google/gemini-2.0-flash-lite` - 軽量版（無料）

**推奨**: 安定した無料利用には`google/gemini-flash-latest`がおすすめです。

**注意**: Googleは定期的にモデルを更新します。最新の利用可能なモデルは[Google AI Studio](https://ai.google.dev/gemini-api/docs/models)で確認できます。

モデルを変更するには、`src/mastra/agents/weather-agent.ts`と`src/mastra/scorers/weather-scorer.ts`の`model`フィールドを編集してください。
