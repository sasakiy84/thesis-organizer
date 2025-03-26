// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// プロジェクト設定の保存と読み込みのためのAPIを公開
contextBridge.exposeInMainWorld('projectAPI', {
  // Working Dirの選択ダイアログを開く
  selectWorkingDir: () => ipcRenderer.invoke('select-working-dir'),
  
  // プロジェクト設定を保存する
  saveProjectSettings: (settings: {
    projectName: string;
    projectDescription: string;
    workingDir: string;
    repositoryDir?: string;
  }) => ipcRenderer.invoke('save-project-settings', settings),
  
  // 保存済みのプロジェクト設定を読み込む
  loadProjectSettings: () => ipcRenderer.invoke('load-project-settings'),
});
