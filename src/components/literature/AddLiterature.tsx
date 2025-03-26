import type React from 'react';
import { useState } from 'react';
import { 
  Box, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { type Literature, LiteratureSchema } from '../../types';
import LiteratureForm from './LiteratureForm';

interface AddLiteratureProps {
  onSaved?: (id: string) => void;
}

const AddLiterature: React.FC<AddLiteratureProps> = ({ onSaved }) => {
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

  // 論文データを保存
  const handleSave = async (literatureData: Literature) => {
    try {
      // Zodでのバリデーション
      LiteratureSchema.parse(literatureData);
      
      // メインプロセスへの保存リクエスト
      const result = await window.projectAPI.saveLiterature(literatureData);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: '論文情報を保存しました',
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

  return (
    <Box>
      <LiteratureForm onSave={handleSave} />
      
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

export default AddLiterature;