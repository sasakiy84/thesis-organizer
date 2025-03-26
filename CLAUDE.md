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
- **Material UI** を使用してコンポーネントを作成