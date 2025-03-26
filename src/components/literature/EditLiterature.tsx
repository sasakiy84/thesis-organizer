import type React from 'react';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Snackbar, 
  Alert,
  Paper,
  Typography,
  CircularProgress,
  Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { type Literature, LiteratureSchema } from '../../types';
import LiteratureForm from './LiteratureForm';

interface EditLiteratureProps {
  literatureId: string;
  onSaved?: (id: string) => void;
  onBack: () => void;
}

const EditLiterature: React.FC<EditLiteratureProps> = ({ literatureId, onSaved, onBack }) => {
  // 論文データ
  const [literature, setLiterature] = useState<Literature | null>(null);
  // ローディング状態
  const [loading, setLoading] = useState(true);
  // エラー状態
  const [error, setError] = useState<string | null>(null);
  
  // Snackbar状態
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 論文データの読み込み
  useEffect(() => {
    const loadLiterature = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await window.projectAPI.loadLiterature(literatureId);
        if (data) {
          setLiterature(data);
        } else {
          setError('論文データが見つかりませんでした');
        }
      } catch (err) {
        console.error('論文データの読み込みに失敗しました:', err);
        setError('論文データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadLiterature();
  }, [literatureId]);

  // 論文データを保存
  const handleSave = async (literatureData: Literature) => {
    try {
      // IDを保持
      literatureData.id = literatureId;
      
      console.log('保存される文献データ: ', literatureData);
      
      // Zodでのバリデーション
      LiteratureSchema.parse(literatureData);
      
      // メインプロセスへの保存リクエスト
      const result = await window.projectAPI.saveLiterature(literatureData);
      
      if (result.success) {
        // コンポーネントの状態を更新
        setLiterature(literatureData);
        
        setSnackbar({
          open: true,
          message: '論文情報を更新しました',
          severity: 'success',
        });
        
        // 親コンポーネントに保存完了を通知
        if (onSaved) {
          onSaved(result.id);
        }
      } else {
        setSnackbar({
          open: true,
          message: `保存に失敗しました: ${result.error}`,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('バリデーションエラー:', error);
      setSnackbar({
        open: true,
        message: `データに問題があります: ${error.message}`,
        severity: 'error',
      });
    }
  };

  // Snackbarを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, width: '100%', mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, width: '100%', mt: 4 }}>
        <Typography variant="h5" color="error" gutterBottom>
          エラー
        </Typography>
        <Typography variant="body1" paragraph>
          {error}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          一覧に戻る
        </Button>
      </Paper>
    );
  }

  if (!literature) {
    return (
      <Paper elevation={3} sx={{ p: 3, width: '100%', mt: 4 }}>
        <Typography variant="h5" color="warning" gutterBottom>
          論文データが見つかりません
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          一覧に戻る
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          一覧に戻る
        </Button>
      </Box>
      
      <LiteratureForm initialData={literature} onSave={handleSave} />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditLiterature;