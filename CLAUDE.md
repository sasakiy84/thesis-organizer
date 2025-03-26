# Thesis Organizer - 開発ガイドライン

commit message は基本的に日本語を用いる。

## ビルドコマンド  
- `npm start` - 開発モードでアプリを起動  
- `npm run package` - 現在のプラットフォーム向けにアプリをパッケージ化  
- `npm run make` - 現在のプラットフォーム向けに配布可能なファイルを作成  
- `npm run publish` - アプリを公開  
- `npm run lint` - すべての TypeScript/TSX ファイルに対して ESLint を実行  

## コードスタイルガイドライン  
- **TypeScript**: `noImplicitAny: true` を設定し、厳密な型付けを使用  
- **React**: クラスコンポーネントを使用せず、フックを用いた関数コンポーネントのみ使用  
- **インポートの順序**: 以下の順序でグループ化  
  1. React / Electron  
  2. サードパーティライブラリ  
  3. 内部モジュール  
- **フォーマット**:  
  - インデントは 2 スペース  
  - セミコロン必須  
- **命名規則**:  
  - コンポーネント: `PascalCase`（例: `MyComponent`）  
  - 関数・変数: `camelCase`（例: `myFunction`）  
  - 定数: `UPPER_SNAKE_CASE`（例: `MY_CONSTANT`）  
- **エラーハンドリング**: 非同期処理には `try/catch` を使用。ただし、最小限にとどめる。Error を継承したカスタムエラークラスを利用して、適切にエラーハンドリングを行う。また、エラーはフロントエンド側に表示して、フィードバックをする。Toast などを利用すれば良い。
- **ファイル構成**: 関連するコンポーネントやユーティリティをグループ化  

## プロジェクト構成  
- `src/main.ts` - Electron メインプロセスのエントリーポイント  
- `src/preload.ts` - セキュアな IPC のためのプリロードスクリプト  
- `src/app.tsx` - React のエントリーポイント  
- `src/components/` - React コンポーネント
  - `src/components/literature/` - 論文関連のコンポーネント
    - `AddLiterature.tsx` - 新規論文追加画面
    - `LiteratureForm.tsx` - 論文入力フォーム
    - `LiteratureList.tsx` - 論文一覧画面
    - `CommonMetadataForm.tsx` - 共通メタデータフォーム（タイトル、著者など）
  - `src/components/attributes/` - 属性関連のコンポーネント
    - `AttributeManagement.tsx` - 属性管理のメイン画面
    - `AttributeSchemaForm.tsx` - 属性スキーマ編集フォーム
    - `AttributeSchemaList.tsx` - 属性スキーマ一覧
    - `AttributeSelector.tsx` - 論文に属性を適用するためのセレクター
- `src/types.ts` - 型定義ファイル

## データ構造
- プロジェクト設定: ユーザーのアプリケーションデータディレクトリに保存
- 論文メタデータ: ワーキングディレクトリに `[id].json` 形式で保存
- 属性スキーマ: ワーキングディレクトリの `attributes/` フォルダに `[id].attribute-schema.json` 形式で保存

## 属性機能の実装
- 属性スキーマは JSON 形式で保存され、ID、名前、説明、定義済み値のリスト、自由入力許可フラグを含む
- 属性は論文メタデータに適用でき、複数の値（定義済み値または自由入力）を持つことができる
- Node.js v22 の glob API を使用して属性スキーマファイルを検索
- glob の AsyncIterable を正しく処理するため、for-await-of 構文を使用

**Material UI** を使用してコンポーネントを作成