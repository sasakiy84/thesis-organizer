import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// ユーザーデータフォルダへのパスを取得
const userDataPath = app.getPath('userData');
const settingsFilePath = path.join(userDataPath, 'project-settings.json');

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Working Dirの選択ダイアログを開くハンドラー
ipcMain.handle('select-working-dir', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: 'Working Directoryを選択してください',
    buttonLabel: '選択',
  });
  
  if (canceled) {
    return null;
  }
  
  return filePaths[0];
});

// プロジェクト設定を保存するハンドラー
ipcMain.handle('save-project-settings', async (_, settings) => {
  try {
    // プロジェクト設定をJSONファイルとして保存
    await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
    
    // Working Dirにプロジェクトのメタデータファイルを作成
    const workingDirMetadataFile = path.join(settings.workingDir, 'project-metadata.json');
    await fs.writeFile(workingDirMetadataFile, JSON.stringify({
      projectName: settings.projectName,
      projectDescription: settings.projectDescription,
      workingDir: settings.workingDir,
      repositoryDir: settings.repositoryDir || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, null, 2), 'utf-8');
    
    // 属性スキーマの初期ファイルを作成
    const attributesSchemaFile = path.join(settings.workingDir, 'schema.attributes.json');
    await fs.writeFile(attributesSchemaFile, JSON.stringify([], null, 2), 'utf-8');
    
    return { success: true };
  } catch (error) {
    console.error('プロジェクト設定の保存に失敗しました:', error);
    return { success: false, error: error.message };
  }
});

// 保存済みのプロジェクト設定を読み込むハンドラー
ipcMain.handle('load-project-settings', async () => {
  try {
    const data = await fs.readFile(settingsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // ファイルが存在しない場合は空のオブジェクトを返す
    if (error.code === 'ENOENT') {
      return null;
    }
    console.error('プロジェクト設定の読み込みに失敗しました:', error);
    return null;
  }
});
