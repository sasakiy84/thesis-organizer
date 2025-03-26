// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { AttributeSchema, Literature, NavigationState, ProjectSettings } from './types';

// プロジェクト設定と論文メタデータのためのAPIを公開
contextBridge.exposeInMainWorld('projectAPI', {
  // Working Dirの選択ダイアログを開く
  selectWorkingDir: () => ipcRenderer.invoke('select-working-dir'),
  
  // プロジェクト設定を保存する
  saveProjectSettings: (settings: ProjectSettings) => ipcRenderer.invoke('save-project-settings', settings),
  
  // 保存済みのプロジェクト設定を読み込む
  loadProjectSettings: () => ipcRenderer.invoke('load-project-settings'),
  
  // 既存プロジェクトに切り替える
  switchProject: (workingDir: string) => ipcRenderer.invoke('switch-project', workingDir),
  
  // 論文メタデータを保存する
  saveLiterature: (literature: Literature) => ipcRenderer.invoke('save-literature', literature),
  
  // 論文メタデータを読み込む
  loadLiterature: (id: string) => ipcRenderer.invoke('load-literature', id),
  
  // 論文メタデータの一覧を取得する
  listLiteratures: () => ipcRenderer.invoke('list-literatures'),
  
  // PDFファイルの選択ダイアログを開く
  selectPdfFile: () => ipcRenderer.invoke('select-pdf-file'),
  
  // PDFファイルを外部アプリケーションで開く
  openPdfFile: (filePath: string) => ipcRenderer.invoke('open-pdf-file', filePath),
  
  // JSONファイルを外部アプリケーションで開く
  openJsonFile: (id: string) => ipcRenderer.invoke('open-json-file', id),
  
  // テキストをクリップボードにコピー
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),
  
  // 絶対パスを取得
  getAbsolutePath: (relativePath: string) => ipcRenderer.invoke('get-absolute-path', relativePath),
  
  // 属性スキーマを保存する
  saveAttributeSchema: (schema: AttributeSchema) => ipcRenderer.invoke('save-attribute-schema', schema),
  
  // 属性スキーマを削除する
  deleteAttributeSchema: (id: string) => ipcRenderer.invoke('delete-attribute-schema', id),
  
  // 属性スキーマを読み込む
  loadAttributeSchema: (id: string) => ipcRenderer.invoke('load-attribute-schema', id),
  
  // 属性スキーマの一覧を取得する
  listAttributeSchemas: () => ipcRenderer.invoke('list-attribute-schemas'),
  
  // 属性情報をエクスポートする
  exportAttributes: (config?: { format?: 'csv' | 'tsv', fields?: string[], attributeIds?: string[] }) => 
    ipcRenderer.invoke('export-attributes', config),
  
  // エクスポートファイルを保存する
  saveExportFile: (data: string, format: 'csv' | 'tsv') => ipcRenderer.invoke('save-export-file', data, format),
  
  // ナビゲーション状態を保存する
  saveNavigationState: (state: NavigationState) => ipcRenderer.invoke('save-navigation-state', state),
  
  // ナビゲーション状態を読み込む
  loadNavigationState: () => ipcRenderer.invoke('load-navigation-state'),
});
