import { z } from 'zod';

// プロジェクト設定のスキーマ
export const ProjectSettingsSchema = z.object({
  projectName: z.string().min(1, 'プロジェクト名は必須です'),
  projectDescription: z.string(),
  workingDir: z.string().min(1, 'Working Directoryは必須です'),
  repositoryDir: z.string().optional(),
});

export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;

// プロジェクトメタデータのスキーマ
export const ProjectMetadataSchema = ProjectSettingsSchema.extend({
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;

// 属性値のスキーマ
export const AttributeValueSchema = z.object({
  id: z.string(),
  value: z.string(),
});

export type AttributeValue = z.infer<typeof AttributeValueSchema>;

// 属性スキーマの定義
export const AttributeSchemaSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '属性名は必須です'),
  description: z.string().optional(),
  predefinedValues: z.array(AttributeValueSchema).optional(),
  allowFreeText: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AttributeSchema = z.infer<typeof AttributeSchemaSchema>;

// 属性適用のスキーマ
export const AttributeApplicationSchema = z.object({
  attributeId: z.string(),
  values: z.array(z.string()),
  note: z.string().optional(),
});

export type AttributeApplication = z.infer<typeof AttributeApplicationSchema>;

// すべての文献タイプに共通するメタデータのスキーマ
export const CommonMetadataSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'タイトルは必須です'),
  year: z.number().int().min(1000).max(new Date().getFullYear() + 10),
  authors: z.array(z.string()).min(1, '著者は最低1人必要です'),
  notes: z.string().optional(),
  pdfFilePath: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  attributes: z.array(AttributeApplicationSchema).optional(),
});

export type CommonMetadata = z.infer<typeof CommonMetadataSchema>;

// 学術論文のスキーマ
export const JournalArticleSchema = CommonMetadataSchema.extend({
  type: z.literal('journal_article'),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().optional(),
  publisher: z.string().optional(),
});

export type JournalArticle = z.infer<typeof JournalArticleSchema>;

// 会議論文のスキーマ
export const ConferencePaperSchema = CommonMetadataSchema.extend({
  type: z.literal('conference_paper'),
  conference: z.string().optional(),
  location: z.string().optional(),
  pages: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().optional(),
  publisher: z.string().optional(),
});

export type ConferencePaper = z.infer<typeof ConferencePaperSchema>;

// 書籍のスキーマ
export const BookSchema = CommonMetadataSchema.extend({
  type: z.literal('book'),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  edition: z.string().optional(),
  totalPages: z.number().int().positive().optional(),
});

export type Book = z.infer<typeof BookSchema>;

// 書籍の章のスキーマ
export const BookChapterSchema = CommonMetadataSchema.extend({
  type: z.literal('book_chapter'),
  bookTitle: z.string().optional(),
  publisher: z.string().optional(),
  editors: z.array(z.string()).optional(),
  chapter: z.string().optional(),
  pages: z.string().optional(),
  isbn: z.string().optional(),
});

export type BookChapter = z.infer<typeof BookChapterSchema>;

// 学位論文のスキーマ
export const ThesisSchema = CommonMetadataSchema.extend({
  type: z.literal('thesis'),
  thesisType: z.enum(['doctoral', 'masters', 'bachelors']).optional(),
  institution: z.string().optional(),
  department: z.string().optional(),
  url: z.string().optional(),
});

export type Thesis = z.infer<typeof ThesisSchema>;

// その他の文献タイプのスキーマ
export const OtherLiteratureSchema = CommonMetadataSchema.extend({
  type: z.literal('other'),
  sourceType: z.string().optional(),
  source: z.string().optional(),
  url: z.string().optional(),
});

export type OtherLiterature = z.infer<typeof OtherLiteratureSchema>;

// すべての文献タイプを結合
export const LiteratureSchema = z.discriminatedUnion('type', [
  JournalArticleSchema,
  ConferencePaperSchema,
  BookSchema,
  BookChapterSchema,
  ThesisSchema,
  OtherLiteratureSchema
]);

export type Literature = z.infer<typeof LiteratureSchema>;

// 属性エクスポートのための型定義
export interface AttributeExportRow {
  id: string;
  attribute: string;
  value: string;
}

// エクスポート対象のフィールド
export type ExportField = 
  | 'id' 
  | 'title' 
  | 'year' 
  | 'authors' 
  | 'filename' 
  | 'filepath' 
  | 'attribute'
  | 'value';

// エクスポート設定
export interface ExportConfig {
  format: 'csv' | 'tsv';
  fields: ExportField[];
  attributeIds?: string[]; // 指定した場合、その属性のみエクスポート
}

// ナビゲーション状態
export interface NavigationState {
  currentPage: string;
  selectedLiteratureId?: string | null;
  searchFilters?: LiteratureSearchFilters;
  pagination?: {
    page: number;
    rowsPerPage: number;
  }
}

// 検索フィルター状態
export interface LiteratureSearchFilters {
  title?: string;
  author?: string;
  year?: string;
  attribute?: string;
}

// プロジェクト履歴の型
export interface ProjectHistoryItem {
  projectName: string;
  workingDir: string;
  lastOpenedAt: string;
}

// Window APIの型定義
export interface ProjectAPI {
  selectWorkingDir: () => Promise<string | null>;
  saveProjectSettings: (settings: ProjectSettings) => Promise<{ success: boolean; error?: string }>;
  loadProjectSettings: () => Promise<ProjectSettings | null>;
  // 既存プロジェクトに切り替え
  switchProject: (workingDir: string) => Promise<{ success: boolean; error?: string }>;
  // 論文メタデータの保存
  saveLiterature: (literature: Literature) => Promise<{ success: boolean; id: string; error?: string }>;
  // 論文メタデータの読み込み
  loadLiterature: (id: string) => Promise<Literature | null>;
  // 論文メタデータの一覧を取得
  listLiteratures: () => Promise<{ id: string; title: string; type: string; year: number; authors?: string[] }[]>;
  // PDFファイルの選択
  selectPdfFile: () => Promise<string | null>;
  // PDFファイルを開く
  openPdfFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  // JSONファイルを開く
  openJsonFile: (id: string) => Promise<{ success: boolean; error?: string }>;
  // テキストをクリップボードにコピー
  copyToClipboard: (text: string) => Promise<{ success: boolean; error?: string }>;
  // 絶対パスを取得
  getAbsolutePath: (relativePath: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  // 属性スキーマの保存
  saveAttributeSchema: (schema: AttributeSchema) => Promise<{ success: boolean; id: string; error?: string }>;
  // 属性スキーマの削除
  deleteAttributeSchema: (id: string) => Promise<{ success: boolean; error?: string }>;
  // 属性スキーマの読み込み
  loadAttributeSchema: (id: string) => Promise<AttributeSchema | null>;
  // 属性スキーマ一覧の取得
  listAttributeSchemas: () => Promise<{ id: string; name: string }[]>;
  // 属性情報のエクスポート
  exportAttributes: (format?: 'csv' | 'tsv') => Promise<{ success: boolean; data?: string; error?: string }>;
  // エクスポートファイルの保存
  saveExportFile: (data: string, format: 'csv' | 'tsv') => Promise<{ success: boolean; filePath?: string; error?: string }>;
  // ナビゲーション状態の保存
  saveNavigationState: (state: NavigationState) => Promise<{ success: boolean; error?: string }>;
  // ナビゲーション状態の読み込み
  loadNavigationState: () => Promise<NavigationState | null>;
  // プロジェクト履歴の取得
  getProjectHistory: () => Promise<ProjectHistoryItem[]>;
}