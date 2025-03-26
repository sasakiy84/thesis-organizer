import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import { glob } from 'node:fs/promises';
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

// 時間ベースのユニークIDを生成する関数
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

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
    
    // 属性スキーマディレクトリを作成
    const attributesSchemaDirPath = path.join(settings.workingDir, 'attributes');
    try {
      await fs.mkdir(attributesSchemaDirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
    
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

// 論文メタデータを保存するハンドラー
ipcMain.handle('save-literature', async (_, literature) => {
  try {
    // 現在のプロジェクト設定を取得
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // IDがない場合は新規作成として扱い、IDを生成
    let id = literature.id;
    if (!id) {
      id = generateId();
      literature.id = id;
    }
    
    // タイムスタンプを設定
    const now = new Date().toISOString();
    if (!literature.createdAt) {
      literature.createdAt = now;
    }
    literature.updatedAt = now;
    
    // Working Dirに論文メタデータを保存
    const literatureFilePath = path.join(settings.workingDir, `${id}.json`);
    await fs.writeFile(literatureFilePath, JSON.stringify(literature, null, 2), 'utf-8');
    
    return { success: true, id };
  } catch (error) {
    console.error('論文メタデータの保存に失敗しました:', error);
    return { success: false, error: error.message };
  }
});

// 論文メタデータを読み込むハンドラー
ipcMain.handle('load-literature', async (_, id) => {
  try {
    // 現在のプロジェクト設定を取得
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // 指定されたIDの論文メタデータを読み込む
    const literatureFilePath = path.join(settings.workingDir, `${id}.json`);
    const data = await fs.readFile(literatureFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('論文メタデータの読み込みに失敗しました:', error);
    return null;
  }
});

// 論文メタデータの一覧を取得するハンドラー
ipcMain.handle('list-literatures', async () => {
  try {
    // 現在のプロジェクト設定を取得
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // Working Dirからすべての.jsonファイルを取得
    const files = await fs.readdir(settings.workingDir);
    const literatureFiles = files.filter(file => 
      file.endsWith('.json') && 
      file !== 'project-metadata.json' && 
      !file.endsWith('attribute-schema.json')
    );
    
    // メタデータの一覧を作成
    const literatures = await Promise.all(
      literatureFiles.map(async (file) => {
        try {
          const filePath = path.join(settings.workingDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const literature = JSON.parse(data);
          return {
            id: literature.id,
            title: literature.title,
            type: literature.type,
            year: literature.year
          };
        } catch (error) {
          console.error(`ファイル ${file} の読み込みに失敗しました:`, error);
          return null;
        }
      })
    );
    
    // nullの結果を除外
    return literatures.filter(item => item !== null);
  } catch (error) {
    console.error('論文メタデータ一覧の取得に失敗しました:', error);
    return [];
  }
});

// PDFファイルの選択ダイアログを開くハンドラー
ipcMain.handle('select-pdf-file', async () => {
  try {
    // 現在のプロジェクト設定を取得（Repository Dirのベースディレクトリを取得するため）
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // ダイアログオプションを設定
    const dialogOptions: any = {
      properties: ['openFile'],
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      title: 'PDFファイルを選択してください',
      buttonLabel: '選択',
    };
    
    // Repository Dirが設定されている場合は、そこをデフォルトディレクトリにする
    if (settings.repositoryDir) {
      dialogOptions.defaultPath = settings.repositoryDir;
    }
    
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    
    if (canceled) {
      return null;
    }
    
    const selectedPath = filePaths[0];
    
    // Repository Dirが設定されている場合は、相対パスを返す
    if (settings.repositoryDir && selectedPath.startsWith(settings.repositoryDir)) {
      return path.relative(settings.repositoryDir, selectedPath);
    }
    
    return selectedPath;
  } catch (error) {
    console.error('PDFファイルの選択に失敗しました:', error);
    return null;
  }
});

// 属性スキーマを保存するハンドラー
ipcMain.handle('save-attribute-schema', async (_, schema) => {
  try {
    // 現在のプロジェクト設定を取得
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // IDがない場合は新規作成として扱い、IDを生成
    let id = schema.id;
    if (!id) {
      id = generateId();
      schema.id = id;
    }
    
    // タイムスタンプを設定
    const now = new Date().toISOString();
    if (!schema.createdAt) {
      schema.createdAt = now;
    }
    schema.updatedAt = now;
    
    // 属性スキーマディレクトリを確認
    const attributesSchemaDirPath = path.join(settings.workingDir, 'attributes');
    try {
      await fs.mkdir(attributesSchemaDirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
    
    // 属性スキーマをJSONファイルとして保存
    const schemaFilePath = path.join(attributesSchemaDirPath, `${id}.attribute-schema.json`);
    await fs.writeFile(schemaFilePath, JSON.stringify(schema, null, 2), 'utf-8');
    
    return { success: true, id };
  } catch (error) {
    console.error('属性スキーマの保存に失敗しました:', error);
    return { success: false, error: error.message };
  }
});

// 属性スキーマを削除するハンドラー
ipcMain.handle('delete-attribute-schema', async (_, id) => {
  try {
    // 現在のプロジェクト設定を取得
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // 属性スキーマファイルパスを作成
    const attributesSchemaDirPath = path.join(settings.workingDir, 'attributes');
    const schemaFilePath = path.join(attributesSchemaDirPath, `${id}.attribute-schema.json`);
    
    // ファイルが存在するか確認
    try {
      await fs.access(schemaFilePath);
    } catch (error) {
      return { success: false, error: '指定された属性スキーマが見つかりません' };
    }
    
    // ファイルを削除
    await fs.unlink(schemaFilePath);
    
    return { success: true };
  } catch (error) {
    console.error('属性スキーマの削除に失敗しました:', error);
    return { success: false, error: error.message };
  }
});

// 属性スキーマを読み込むハンドラー
ipcMain.handle('load-attribute-schema', async (_, id) => {
  try {
    // 現在のプロジェクト設定を取得
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // 属性スキーマファイルパスを作成
    const attributesSchemaDirPath = path.join(settings.workingDir, 'attributes');
    const schemaFilePath = path.join(attributesSchemaDirPath, `${id}.attribute-schema.json`);
    
    // ファイルが存在するか確認
    try {
      await fs.access(schemaFilePath);
    } catch (error) {
      return null;
    }
    
    // 属性スキーマを読み込む
    const data = await fs.readFile(schemaFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('属性スキーマの読み込みに失敗しました:', error);
    return null;
  }
});

// 属性スキーマの一覧を取得するハンドラー
ipcMain.handle('list-attribute-schemas', async () => {
  try {
    // 現在のプロジェクト設定を取得
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // 属性スキーマディレクトリを確認
    const attributesSchemaDirPath = path.join(settings.workingDir, 'attributes');
    try {
      await fs.mkdir(attributesSchemaDirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
    
    // 属性スキーマファイルを検索
    // glob関数はAsyncIterableを返すので、配列に変換する
    const files = [];
    for await (const file of glob('*.attribute-schema.json', { 
      cwd: attributesSchemaDirPath,
      withFileTypes: false
    })) {
      files.push(file);
    }
    
    // スキーマの一覧を作成
    const schemas = await Promise.all(
      files.map(async (file) => {
        try {
          const filePath = path.join(attributesSchemaDirPath, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const schema = JSON.parse(data);
          return {
            id: schema.id,
            name: schema.name
          };
        } catch (error) {
          console.error(`ファイル ${file} の読み込みに失敗しました:`, error);
          return null;
        }
      })
    );
    
    // nullの結果を除外
    return schemas.filter(item => item !== null);
  } catch (error) {
    console.error('属性スキーマ一覧の取得に失敗しました:', error);
    return [];
  }
});
