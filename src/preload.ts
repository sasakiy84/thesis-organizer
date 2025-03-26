// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { Literature, ProjectSettings } from './types';

// プロジェクト設定と論文メタデータのためのAPIを公開
contextBridge.exposeInMainWorld('projectAPI', {
  // Working Dirの選択ダイアログを開く
  selectWorkingDir: () => ipcRenderer.invoke('select-working-dir'),
  
  // プロジェクト設定を保存する
  saveProjectSettings: (settings: ProjectSettings) => ipcRenderer.invoke('save-project-settings', settings),
  
  // 保存済みのプロジェクト設定を読み込む
  loadProjectSettings: () => ipcRenderer.invoke('load-project-settings'),
  
  // 論文メタデータを保存する
  saveLiterature: (literature: Literature) => ipcRenderer.invoke('save-literature', literature),
  
  // 論文メタデータを読み込む
  loadLiterature: (id: string) => ipcRenderer.invoke('load-literature', id),
  
  // 論文メタデータの一覧を取得する
  listLiteratures: () => ipcRenderer.invoke('list-literatures'),
  
  // PDFファイルの選択ダイアログを開く
  selectPdfFile: () => ipcRenderer.invoke('select-pdf-file'),
});
