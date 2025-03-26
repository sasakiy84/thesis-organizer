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
}