import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AttributeSchema } from '../../types';

interface AttributeSchemaListProps {
  onCreateNew: () => void;
  onEdit: (id: string) => void;
}

const AttributeSchemaList: React.FC<AttributeSchemaListProps> = ({
  onCreateNew,
  onEdit,
}) => {
  // 状態
  const [schemas, setSchemas] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schemaToDelete, setSchemaToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // 属性スキーマ一覧を取得
  const loadSchemas = async () => {
    try {
      setLoading(true);
      const schemaList = await window.projectAPI.listAttributeSchemas();
      if (Array.isArray(schemaList)) {
        setSchemas(schemaList);
      } else {
        // 配列でない場合は空配列を設定
        console.error('属性スキーマ一覧が配列ではありません:', schemaList);
        setSchemas([]);
        throw new Error('属性スキーマ一覧の形式が正しくありません');
      }
    } catch (error) {
      console.error('属性スキーマ一覧の取得に失敗しました:', error);
      setSnackbar({
        open: true,
        message: `属性スキーマの読み込みに失敗しました: ${error.message || '不明なエラー'}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // 初期読み込み
  useEffect(() => {
    loadSchemas();
  }, []);

  // 削除ダイアログを開く
  const handleOpenDeleteDialog = (id: string) => {
    setSchemaToDelete(id);
    setDeleteDialogOpen(true);
  };

  // 削除ダイアログを閉じる
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSchemaToDelete(null);
  };

  // 属性スキーマを削除
  const handleDelete = async () => {
    if (!schemaToDelete) return;

    try {
      const result = await window.projectAPI.deleteAttributeSchema(schemaToDelete);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: '属性スキーマを削除しました',
          severity: 'success',
        });
        
        // 一覧を更新
        await loadSchemas();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('属性スキーマの削除に失敗しました:', error);
      setSnackbar({
        open: true,
        message: `属性スキーマの削除に失敗しました: ${error.message || '不明なエラー'}`,
        severity: 'error',
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">属性定義一覧</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateNew}
        >
          新規作成
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : schemas.length === 0 ? (
        <Typography variant="body1" sx={{ my: 4, textAlign: 'center' }}>
          属性定義がまだありません。「新規作成」ボタンをクリックして作成してください。
        </Typography>
      ) : (
        <List>
          {schemas.map((schema, index) => (
            <React.Fragment key={schema.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemText
                  primary={schema.name}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => onEdit(schema.id)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleOpenDeleteDialog(schema.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>属性定義の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            この属性定義を削除してもよろしいですか？この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>キャンセル</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            削除
          </Button>
        </DialogActions>
      </Dialog>

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
    </Paper>
  );
};

export default AttributeSchemaList;