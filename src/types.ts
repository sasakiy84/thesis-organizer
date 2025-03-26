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
  attributes: z.array(
    z.object({
      attributeName: z.string(),
      values: z.array(z.string()),
      note: z.string().optional(),
    })
  ).optional(),
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

// 属性定義のスキーマ
export const AttributeDefinitionSchema = z.object({
  attributeName: z.string().min(1, '属性名は必須です'),
  values: z.array(z.string()),
});

export type AttributeDefinition = z.infer<typeof AttributeDefinitionSchema>;

// Window APIの型定義
export interface ProjectAPI {
  selectWorkingDir: () => Promise<string | null>;
  saveProjectSettings: (settings: ProjectSettings) => Promise<{ success: boolean; error?: string }>;
  loadProjectSettings: () => Promise<ProjectSettings | null>;
  // 論文メタデータの保存
  saveLiterature: (literature: Literature) => Promise<{ success: boolean; id: string; error?: string }>;
  // 論文メタデータの読み込み
  loadLiterature: (id: string) => Promise<Literature | null>;
  // 論文メタデータの一覧を取得
  listLiteratures: () => Promise<{ id: string; title: string; type: string; year: number }[]>;
  // PDFファイルの選択
  selectPdfFile: () => Promise<string | null>;
}