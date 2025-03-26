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
import EditLiterature from './components/literature/EditLiterature';
import LiteratureList from './components/literature/LiteratureList';
import LiteratureDetails from './components/literature/LiteratureDetails';
import AttributeManagement from './components/attributes/AttributeManagement';

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
  // 選択中の論文ID（編集/詳細表示用）
  const [selectedLiteratureId, setSelectedLiteratureId] = useState<string | null>(null);
  // 論文一覧の検索フィルター状態
  const [searchFilters, setSearchFilters] = useState<{ 
    title?: string; 
    author?: string; 
    year?: string; 
    attribute?: string;
  }>({});
  // ページネーション状態
  const [pagination, setPagination] = useState<{
    page: number;
    rowsPerPage: number;
  }>({ page: 0, rowsPerPage: 100 });
  
  // コンポーネントマウント時にプロジェクト設定とナビゲーション状態を確認
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // プロジェクト設定を読み込む
        const settings = await window.projectAPI.loadProjectSettings();
        
        if (settings?.workingDir) {
          setProjectLoaded(true);
          
          // ナビゲーション状態を読み込む
          const navState = await window.projectAPI.loadNavigationState();
          
          if (navState) {
            // 保存されたナビゲーション状態があれば復元
            setCurrentPage(navState.currentPage || 'literatureList');
            setSelectedLiteratureId(navState.selectedLiteratureId || null);
            
            if (navState.searchFilters) {
              setSearchFilters(navState.searchFilters);
            }
            
            if (navState.pagination) {
              setPagination(navState.pagination);
            }
          } else {
            // なければデフォルト状態で論文一覧を表示
            setCurrentPage('literatureList');
          }
        } else {
          setProjectLoaded(false);
          setCurrentPage('settings'); // 未設定ならプロジェクト設定画面を表示
        }
      } catch (error) {
        console.error('アプリの初期化に失敗しました:', error);
        setProjectLoaded(false);
      }
    };
    
    initializeApp();
  }, []);
  
  // ナビゲーション状態の変更時に保存（デバウンス処理を追加）
  useEffect(() => {
    // プロジェクト未設定時は保存しない
    if (!projectLoaded) return;
    
    const saveNavigationState = async () => {
      try {
        await window.projectAPI.saveNavigationState({
          currentPage,
          selectedLiteratureId,
          searchFilters,
          pagination
        });
      } catch (error) {
        console.error('ナビゲーション状態の保存に失敗しました:', error);
      }
    };
    
    // 300ms間隔でデバウンスして保存処理を実行（頻繁な保存を防止）
    const debounceId = setTimeout(saveNavigationState, 300);
    
    // クリーンアップ関数
    return () => {
      clearTimeout(debounceId);
    };
  }, [currentPage, selectedLiteratureId, projectLoaded]);
  
  // 検索フィルターとページネーション変更時の保存を別のuseEffectで管理
  useEffect(() => {
    // プロジェクト未設定時は保存しない
    if (!projectLoaded) return;
    
    const saveNavigationState = async () => {
      try {
        await window.projectAPI.saveNavigationState({
          currentPage,
          selectedLiteratureId,
          searchFilters,
          pagination
        });
      } catch (error) {
        console.error('ナビゲーション状態の保存に失敗しました:', error);
      }
    };
    
    // 500ms間隔でデバウンスして保存処理を実行（頻繁な保存を防止）
    const debounceId = setTimeout(saveNavigationState, 500);
    
    // クリーンアップ関数
    return () => {
      clearTimeout(debounceId);
    };
  }, [searchFilters, pagination, projectLoaded, currentPage, selectedLiteratureId]);
  
  // ページ遷移ハンドラ
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page !== 'editLiterature' && page !== 'viewLiterature') {
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
  
  // 論文詳細表示ハンドラ
  const handleViewLiterature = (id: string) => {
    setSelectedLiteratureId(id);
    setCurrentPage('viewLiterature');
  };
  
  // 検索フィルターの更新ハンドラ
  const handleSearchFiltersChange = (filters: { 
    title?: string; 
    author?: string; 
    year?: string; 
    attribute?: string;
  }) => {
    setSearchFilters(filters);
  };
  
  // ページネーションの更新ハンドラ
  const handlePaginationChange = (paginationState: {
    page: number;
    rowsPerPage: number;
  }) => {
    setPagination(paginationState);
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
            onViewDetails={handleViewLiterature}
            initialSearchFilters={searchFilters}
            onSearchFiltersChange={handleSearchFiltersChange}
            initialPagination={pagination}
            onPaginationChange={handlePaginationChange}
          />
        );
      case 'addLiterature':
        return <AddLiterature onSaved={handleLiteratureSaved} />;
      case 'editLiterature':
        return selectedLiteratureId ? (
          <EditLiterature
            literatureId={selectedLiteratureId}
            onSaved={handleLiteratureSaved}
            onBack={() => handleNavigate('literatureList')}
          />
        ) : (
          <Alert severity="error" sx={{ mt: 4 }}>
            編集する論文が選択されていません
          </Alert>
        );
      case 'viewLiterature':
        return (
          <LiteratureDetails
            literatureId={selectedLiteratureId || ''}
            onBack={() => handleNavigate('literatureList')}
            onEdit={handleEditLiterature}
          />
        );
      case 'attributeManagement':
        return <AttributeManagement />;
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