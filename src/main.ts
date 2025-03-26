import { app, BrowserWindow, dialog, ipcMain, shell, clipboard } from 'electron';
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
const navigationStatePath = path.join(userDataPath, 'navigation-state.json');

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
    
    // 論文データディレクトリを作成
    const literaturesDirPath = path.join(settings.workingDir, 'literatures');
    try {
      await fs.mkdir(literaturesDirPath, { recursive: true });
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

// 既存プロジェクトに切り替えるハンドラー
ipcMain.handle('switch-project', async (_, workingDir) => {
  try {
    // 指定されたディレクトリにproject-metadata.jsonが存在するか確認
    const metadataFilePath = path.join(workingDir, 'project-metadata.json');
    
    try {
      await fs.access(metadataFilePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { 
          success: false, 
          error: '選択されたフォルダは有効なプロジェクトではありません。project-metadata.jsonが見つかりません。' 
        };
      }
      throw error;
    }
    
    // メタデータを読み込む
    const metadataData = await fs.readFile(metadataFilePath, 'utf-8');
    const metadata = JSON.parse(metadataData);
    
    // プロジェクト設定を更新
    const settings = {
      projectName: metadata.projectName,
      projectDescription: metadata.projectDescription,
      workingDir: workingDir,
      repositoryDir: metadata.repositoryDir || '',
    };
    
    // 設定ファイルに保存
    await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
    
    // literatures ディレクトリが存在するか確認し、なければ作成
    const literaturesDirPath = path.join(workingDir, 'literatures');
    try {
      await fs.access(literaturesDirPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(literaturesDirPath, { recursive: true });
      } else {
        throw error;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('プロジェクト切り替えに失敗しました:', error);
    return { success: false, error: error.message };
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
    
    // literatures ディレクトリを確認し、存在しなければ作成
    const literaturesDirPath = path.join(settings.workingDir, 'literatures');
    try {
      await fs.mkdir(literaturesDirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
    
    // literatures ディレクトリに論文メタデータを保存
    const literatureFilePath = path.join(literaturesDirPath, `${id}.literature.json`);
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
    const literatureFilePath = path.join(settings.workingDir, 'literatures', `${id}.literature.json`);
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
    
    // literatures ディレクトリからすべての .literature.json ファイルを取得
    const literaturesDirPath = path.join(settings.workingDir, 'literatures');
    
    // ディレクトリが存在するか確認
    try {
      await fs.access(literaturesDirPath);
    } catch (error) {
      // ディレクトリが存在しない場合は作成
      if (error.code === 'ENOENT') {
        await fs.mkdir(literaturesDirPath, { recursive: true });
        return []; // 空の配列を返す
      }
      throw error;
    }
    
    // glob関数を使用して .literature.json ファイルを検索
    const files = [];
    for await (const file of glob('*.literature.json', { 
      cwd: literaturesDirPath,
      withFileTypes: false
    })) {
      files.push(file);
    }
    
    // メタデータの一覧を作成
    const literatures = await Promise.all(
      files.map(async (file) => {
        try {
          const filePath = path.join(literaturesDirPath, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const literature = JSON.parse(data);
          return {
            id: literature.id,
            title: literature.title,
            type: literature.type,
            year: literature.year,
            authors: literature.authors, // 著者情報も追加
            attributes: literature.attributes // 属性情報も追加
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

// PDFファイルを開くハンドラー
ipcMain.handle('open-pdf-file', async (_, filePath) => {
  try {
    // 現在のプロジェクト設定を取得
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    let fullPath = filePath;
    
    // 相対パスの場合は絶対パスに変換
    if (settings.repositoryDir && !path.isAbsolute(filePath)) {
      fullPath = path.join(settings.repositoryDir, filePath);
    }
    
    // ファイルの存在確認
    try {
      await fs.access(fullPath);
    } catch (error) {
      console.error('PDFファイルが見つかりません:', fullPath);
      return { success: false, error: 'ファイルが見つかりません' };
    }
    
    // 外部アプリケーションでファイルを開く
    await shell.openPath(fullPath);
    return { success: true };
  } catch (error) {
    console.error('PDFファイルを開く際にエラーが発生しました:', error);
    return { success: false, error: error.message };
  }
});

// JSONファイルを開くハンドラー
ipcMain.handle('open-json-file', async (_, id) => {
  try {
    // 現在のプロジェクト設定を取得
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // JSONファイルのパスを作成
    const jsonFilePath = path.join(settings.workingDir, 'literatures', `${id}.literature.json`);
    
    // ファイルの存在確認
    try {
      await fs.access(jsonFilePath);
    } catch (error) {
      console.error('JSONファイルが見つかりません:', jsonFilePath);
      return { success: false, error: 'ファイルが見つかりません' };
    }
    
    // 外部アプリケーションでファイルを開く
    await shell.openPath(jsonFilePath);
    return { success: true };
  } catch (error) {
    console.error('JSONファイルを開く際にエラーが発生しました:', error);
    return { success: false, error: error.message };
  }
});

// テキストをクリップボードにコピーするハンドラー
ipcMain.handle('copy-to-clipboard', async (_, text) => {
  try {
    clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    console.error('クリップボードへのコピーに失敗しました:', error);
    return { success: false, error: error.message };
  }
});

// 絶対パスを取得するハンドラー
ipcMain.handle('get-absolute-path', async (_, relativePath) => {
  try {
    // 現在のプロジェクト設定を取得
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // パスが既に絶対パスかチェック
    if (path.isAbsolute(relativePath)) {
      return { success: true, path: relativePath };
    }
    
    // リポジトリディレクトリが設定されているか確認
    if (!settings.repositoryDir) {
      return { success: false, error: 'リポジトリディレクトリが設定されていません' };
    }
    
    // 相対パスを絶対パスに変換
    const absolutePath = path.join(settings.repositoryDir, relativePath);
    
    return { success: true, path: absolutePath };
  } catch (error) {
    console.error('絶対パスの取得に失敗しました:', error);
    return { success: false, error: error.message };
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

// 属性情報をエクスポートするハンドラー
ipcMain.handle('export-attributes', async (_, config) => {
  try {
    // デフォルト設定
    const exportConfig = {
      format: 'csv',
      fields: ['id', 'attribute', 'value'],
      attributeIds: undefined,
      ...config
    };
    
    // 現在のプロジェクト設定を取得
    const settingsData = await fs.readFile(settingsFilePath, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // Working Dirからすべての論文ファイルを取得
    const files = await fs.readdir(settings.workingDir);
    const literatureFiles = files.filter(file => 
      file.endsWith('.json') && 
      file !== 'project-metadata.json' && 
      !file.endsWith('attribute-schema.json')
    );
    
    // 論文メタデータの配列を準備
    const literatures = [];
    const attributeSchemas = new Map();
    
    // すべての論文メタデータを読み込む
    for (const file of literatureFiles) {
      try {
        const filePath = path.join(settings.workingDir, file);
        const data = await fs.readFile(filePath, 'utf-8');
        const literature = JSON.parse(data);
        literatures.push(literature);
      } catch (error) {
        console.error(`ファイル ${file} の読み込みに失敗しました:`, error);
      }
    }
    
    // 必要な属性スキーマを読み込む
    if (exportConfig.fields.includes('attribute')) {
      try {
        const attributesDir = path.join(settings.workingDir, 'attributes');
        const schemaFiles = [];
        
        // 属性スキーマファイルを検索
        for await (const file of glob('*.attribute-schema.json', { 
          cwd: attributesDir,
          withFileTypes: false
        })) {
          schemaFiles.push(file);
        }
        
        // スキーマを読み込む
        for (const file of schemaFiles) {
          try {
            const filePath = path.join(attributesDir, file);
            const data = await fs.readFile(filePath, 'utf-8');
            const schema = JSON.parse(data);
            attributeSchemas.set(schema.id, schema);
          } catch (schemaError) {
            console.error(`スキーマファイル ${file} の読み込みに失敗しました:`, schemaError);
          }
        }
      } catch (error) {
        console.error('属性スキーマの読み込みに失敗しました:', error);
      }
    }
    
    // tidy data形式のデータを準備
    const exportRows = [];
    
    // 区切り文字を設定
    const delimiter = exportConfig.format === 'csv' ? ',' : '\t';
    
    // ヘッダー行を作成
    const headers = exportConfig.fields;
    let exportData = headers.join(delimiter) + '\n';
    
    // すべての論文データを処理
    for (const literature of literatures) {
      // 基本データの行を作成（属性以外）
      if (!exportConfig.fields.includes('attribute')) {
        const row = {};
        
        // 要求されたフィールドを追加
        for (const field of exportConfig.fields) {
          if (field === 'id') {
            row['id'] = literature.id;
          } else if (field === 'title') {
            row['title'] = literature.title;
          } else if (field === 'year') {
            row['year'] = literature.year?.toString() || '';
          } else if (field === 'authors') {
            row['authors'] = Array.isArray(literature.authors) 
              ? literature.authors.join('; ') 
              : '';
          } else if (field === 'filename') {
            // ファイル名はパスから抽出
            if (literature.pdfFilePath) {
              row['filename'] = path.basename(literature.pdfFilePath);
            } else {
              row['filename'] = '';
            }
          } else if (field === 'filepath') {
            row['filepath'] = literature.pdfFilePath || '';
          }
        }
        
        // 行をエクスポートデータに追加
        exportRows.push(row);
      }
      // 属性を含むデータを処理
      else if (literature.attributes && Array.isArray(literature.attributes)) {
        // 論文に属性が付与されていれば処理
        for (const attr of literature.attributes) {
          // 特定の属性IDが指定されている場合はフィルタリング
          if (exportConfig.attributeIds && 
              exportConfig.attributeIds.length > 0 && 
              !exportConfig.attributeIds.includes(attr.attributeId)) {
            continue;
          }
          
          if (attr.values && Array.isArray(attr.values)) {
            // 属性名を取得
            const attributeSchema = attributeSchemas.get(attr.attributeId);
            const attributeName = attributeSchema ? attributeSchema.name : attr.attributeId;
            
            // 属性の各値を行として追加
            for (const value of attr.values) {
              const row = {};
              
              // 要求されたフィールドを追加
              for (const field of exportConfig.fields) {
                if (field === 'id') {
                  row['id'] = literature.id;
                } else if (field === 'title') {
                  row['title'] = literature.title;
                } else if (field === 'year') {
                  row['year'] = literature.year?.toString() || '';
                } else if (field === 'authors') {
                  row['authors'] = Array.isArray(literature.authors) 
                    ? literature.authors.join('; ') 
                    : '';
                } else if (field === 'filename') {
                  // ファイル名はパスから抽出
                  if (literature.pdfFilePath) {
                    row['filename'] = path.basename(literature.pdfFilePath);
                  } else {
                    row['filename'] = '';
                  }
                } else if (field === 'filepath') {
                  row['filepath'] = literature.pdfFilePath || '';
                } else if (field === 'attribute') {
                  row['attribute'] = attributeName;
                  row['value'] = value;
                }
              }
              
              exportRows.push(row);
            }
          }
        }
      }
    }
    
    // 空の行セットの場合は処理せず、空のヘッダだけ返す
    if (exportRows.length === 0) {
      return { success: true, data: exportData };
    }
    
    // データ行を作成
    for (const row of exportRows) {
      const rowValues = exportConfig.fields.map(field => {
        const value = row[field] || '';
        return escapeValue(value, delimiter);
      });
      
      exportData += rowValues.join(delimiter) + '\n';
    }
    
    return { success: true, data: exportData };
  } catch (error) {
    console.error('属性情報のエクスポートに失敗しました:', error);
    return { success: false, error: error.message };
  }
});

// 値をCSV/TSV用にエスケープする関数
function escapeValue(value, delimiter) {
  if (typeof value !== 'string') {
    value = String(value);
  }
  
  // 値内に区切り文字やダブルクォートが含まれる場合はエスケープする
  if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}

// エクスポートファイルを保存するハンドラー
ipcMain.handle('save-export-file', async (_, data, format = 'csv') => {
  try {
    const extension = format === 'csv' ? '.csv' : '.tsv';
    const fileTypeDesc = format === 'csv' ? 'CSV Files' : 'TSV Files';
    
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: '属性情報のエクスポート',
      defaultPath: `attributes_export${extension}`,
      filters: [
        { name: fileTypeDesc, extensions: [extension.substring(1)] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory']
    });
    
    if (canceled || !filePath) {
      return { success: false, error: 'キャンセルされました' };
    }
    
    await fs.writeFile(filePath, data, 'utf-8');
    
    return { success: true, filePath };
  } catch (error) {
    console.error('エクスポートファイルの保存に失敗しました:', error);
    return { success: false, error: error.message };
  }
});

// ナビゲーション状態を保存するハンドラー
ipcMain.handle('save-navigation-state', async (_, state) => {
  try {
    await fs.writeFile(navigationStatePath, JSON.stringify(state, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('ナビゲーション状態の保存に失敗しました:', error);
    return { success: false, error: error.message };
  }
});

// ナビゲーション状態を読み込むハンドラー
ipcMain.handle('load-navigation-state', async () => {
  try {
    const data = await fs.readFile(navigationStatePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // ファイルが存在しない場合はnullを返す
    if (error.code === 'ENOENT') {
      return null;
    }
    console.error('ナビゲーション状態の読み込みに失敗しました:', error);
    return null;
  }
});
