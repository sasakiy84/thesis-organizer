# thesis organizer

このアプリケーションは、
論文を整理するための補助アプリケーションで、
以下の機能を持ちます。

- Working Dir の設定：このフォルダに JSON 形式でデータを保存します
- Repository Dir の設定：論文の PDF ファイルが保存されているフォルダを指定します。このフォルダをルートとして、論文に PDF を紐づけることができます
- 論文のメタデータの追加と、それに対しての属性の追加

## 使い方
以下のような使い方を想定しています。

1. Project の設定。Working Dir を設定して、そこにそのプロジェクトのメタデータを全て保存する
  - プロジェクト名
  - プロジェクトの説明
  - Repository Dir の設定
2. 論文の追加
  - 論文のメタデータを追加します。種別、タイトル、著者、年、リンク、出版社、ページ数などです。これらは、JSON Schema で定義され、時系列に沿った ID を付与されます。そして、その ID をファイル名として、Working Dir に JSON で保存されます
  - Repository Dir にあるファイルを紐づけることも可能です。これは、単に紐づけるだけです
3. 論文の属性の追加
  - 属性のスキーマを以下のような形式で定義します。属性の定義は、Working dir の schema.attributes.json に配列で保存されます
    ```
    {
      "attributeName": string,
      "values": string[]
    }
    ```
  - 定義した属性を、論文に追加することができます。論文の attributes フィールドに以下のような形式で保存されます
    ```
    {
      "attributeName": string,
      "values": string[],
      "note": string
    }
    ```
4. 属性情報のエクスポート
  - tidy data 形式で、属性情報をエクスポートすることができます。たとえば、以下のような形式です
    ```
    id, attribute, value
    1, subject, computer science
    1, subject, machine learning
    2, subject, computer science
    1, methodology, deep learning
    2, methodology, bayesian statistics
    ```
  - 入力補助用のアプリケーションのため、このアプリケーション自体でなんらかの分析を行うことは想定していません。

# 実装の方針
1. フロントエンドは、React, Material-UI を使って実装する
2. TypeScript を使って、Type First な開発を行う
3. Zod を使って、入力の境界をきちんと定義、検証する
4. CSS は、最新のものを使う。has selector, not selector, grid layout など