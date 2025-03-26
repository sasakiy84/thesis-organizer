import type React from 'react';
import { useState } from 'react';
import { Container, Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttributeSchemaList from './AttributeSchemaList';
import AttributeSchemaForm from './AttributeSchemaForm';
import type { AttributeSchema } from '../../types';

enum ViewMode {
  LIST = 0,
  CREATE = 1,
  EDIT = 2
}

const AttributeManagement: React.FC = () => {
  // 状態
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [currentSchemaId, setCurrentSchemaId] = useState<string | null>(null);
  const [currentSchema, setCurrentSchema] = useState<AttributeSchema | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // 新規作成モードに切り替え
  const handleCreateNew = () => {
    setCurrentSchemaId(null);
    setCurrentSchema(null);
    setViewMode(ViewMode.CREATE);
  };

  // 編集モードに切り替え
  const handleEdit = async (id: string) => {
    try {
      const schema = await window.projectAPI.loadAttributeSchema(id);
      if (schema) {
        setCurrentSchemaId(id);
        setCurrentSchema(schema);
        setViewMode(ViewMode.EDIT);
      } else {
        throw new Error('属性スキーマが見つかりませんでした');
      }
    } catch (error) {
      console.error('属性スキーマの読み込みに失敗しました:', error);
      setSnackbar({
        open: true,
        message: `属性スキーマの読み込みに失敗しました: ${error.message || '不明なエラー'}`,
        severity: 'error',
      });
    }
  };

  // 一覧表示に戻る
  const handleBackToList = () => {
    setViewMode(ViewMode.LIST);
    setCurrentSchemaId(null);
    setCurrentSchema(null);
  };

  // 属性スキーマを保存
  const handleSaveSchema = async (schema: AttributeSchema) => {
    try {
      const result = await window.projectAPI.saveAttributeSchema(schema);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: '属性スキーマを保存しました',
          severity: 'success',
        });
        
        // 一覧表示に戻る
        handleBackToList();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('属性スキーマの保存に失敗しました:', error);
      setSnackbar({
        open: true,
        message: `属性スキーマの保存に失敗しました: ${error.message || '不明なエラー'}`,
        severity: 'error',
      });
    }
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          属性管理
        </Typography>
        
        {viewMode !== ViewMode.LIST && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
          >
            戻る
          </Button>
        )}
      </Box>

      {/* コンテンツ */}
      {viewMode === ViewMode.LIST && (
        <AttributeSchemaList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
        />
      )}

      {(viewMode === ViewMode.CREATE || viewMode === ViewMode.EDIT) && (
        <AttributeSchemaForm
          initialData={currentSchema || undefined}
          onSave={handleSaveSchema}
          onCancel={handleBackToList}
        />
      )}

      {/* スナックバー */}
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
    </Container>
  );
};

export default AttributeManagement;