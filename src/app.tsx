import { createRoot } from 'react-dom/client';
import type React from 'react';
import { useState, useEffect } from 'react';
import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  Box, 
  Toolbar,
  LinearProgress,
  Alert
} from '@mui/material';
import Navigation from './components/Navigation';
import ProjectSettingsForm from './components/ProjectSettings';
import AddLiterature from './components/literature/AddLiterature';
import LiteratureList from './components/literature/LiteratureList';

// アプリケーションのテーマを設定
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});


// アプリケーションのルートコンポーネント
const App: React.FC = () => {
  // 現在表示中のページ
  const [currentPage, setCurrentPage] = useState<string>('settings');
  // プロジェクト設定の読み込み状態
  const [projectLoaded, setProjectLoaded] = useState<boolean | null>(null);
  // 選択中の論文ID（編集用）
  const [selectedLiteratureId, setSelectedLiteratureId] = useState<string | null>(null);
  
  // コンポーネントマウント時にプロジェクト設定を確認
  useEffect(() => {
    const checkProjectSettings = async () => {
      try {
        const settings = await window.projectAPI.loadProjectSettings();
        if (settings?.workingDir) {
          setProjectLoaded(true);
          setCurrentPage('literatureList'); // 設定済みなら論文一覧を表示
        } else {
          setProjectLoaded(false);
          setCurrentPage('settings'); // 未設定ならプロジェクト設定画面を表示
        }
      } catch (error) {
        console.error('プロジェクト設定の確認に失敗しました:', error);
        setProjectLoaded(false);
      }
    };
    
    checkProjectSettings();
  }, []);
  
  // ページ遷移ハンドラ
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page !== 'editLiterature') {
      setSelectedLiteratureId(null);
    }
  };
  
  // 論文追加完了後のハンドラ
  const handleLiteratureSaved = () => {
    setCurrentPage('literatureList');
  };
  
  // 論文編集時のハンドラ
  const handleEditLiterature = (id: string) => {
    setSelectedLiteratureId(id);
    setCurrentPage('editLiterature');
  };
  
  // 現在のページに応じたコンテンツを表示
  const renderContent = () => {
    // プロジェクト設定のロード中
    if (projectLoaded === null) {
      return <LinearProgress />;
    }
    
    // プロジェクト未設定で設定ページ以外を表示しようとした場合
    if (!projectLoaded && currentPage !== 'settings') {
      return (
        <Alert severity="warning" sx={{ mt: 4 }}>
          プロジェクト設定が必要です。まず設定を完了してください。
        </Alert>
      );
    }
    
    // 各ページのコンテンツ
    switch (currentPage) {
      case 'settings':
        return <ProjectSettingsForm />;
      case 'literatureList':
        return (
          <LiteratureList 
            onAddNew={() => handleNavigate('addLiterature')} 
            onEdit={handleEditLiterature} 
          />
        );
      case 'addLiterature':
        return <AddLiterature onSaved={handleLiteratureSaved} />;
      case 'editLiterature':
        // TODO: 論文編集画面の実装
        return <div>論文編集（ID: {selectedLiteratureId}）</div>;
      default:
        return <div>Unknown page</div>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <Box
          component="main"
          sx={{ 
            flexGrow: 1, 
            p: 3,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Toolbar />
          <Box sx={{ width: '100%', maxWidth: '1200px' }}>
            {renderContent()}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

// Reactをレンダリング
const container = document.getElementById('root') || document.body;
const root = createRoot(container);
root.render(<App />);