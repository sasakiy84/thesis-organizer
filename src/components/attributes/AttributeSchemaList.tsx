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
  Tooltip,
  Checkbox,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { AttributeSchema } from '../../types';
import ExportDialog from './ExportDialog';

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
  const [selectedSchemas, setSelectedSchemas] = useState<string[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportAllDialogOpen, setExportAllDialogOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);

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
        // 選択状態をリセット
        setSelectedSchemas([]);
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

  // 属性の選択状態を切り替え
  const handleToggleSelect = (id: string) => {
    setSelectedSchemas(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(schemaId => schemaId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  // 全選択/解除のトグル
  const handleToggleSelectAll = () => {
    if (selectedSchemas.length === schemas.length) {
      // すべて選択済みなら解除
      setSelectedSchemas([]);
    } else {
      // それ以外なら全選択
      setSelectedSchemas(schemas.map(schema => schema.id));
    }
  };

  // アクションメニューを開く
  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchor(event.currentTarget);
  };

  // アクションメニューを閉じる
  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
  };

  // 選択した属性のエクスポートダイアログを開く
  const handleOpenExportSelected = () => {
    handleCloseActionMenu();
    setExportDialogOpen(true);
  };

  // すべての属性のエクスポートダイアログを開く
  const handleOpenExportAll = () => {
    handleCloseActionMenu();
    setExportAllDialogOpen(true);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">属性定義一覧</Typography>
        <Box>
          {schemas.length > 0 && (
            <>
              <Tooltip title="エクスポート">
                <IconButton
                  onClick={handleOpenActionMenu}
                  sx={{ mr: 1 }}
                >
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={handleCloseActionMenu}
              >
                <MenuItem onClick={handleOpenExportAll}>すべての属性をエクスポート</MenuItem>
                <MenuItem 
                  onClick={handleOpenExportSelected}
                  disabled={selectedSchemas.length === 0}
                >
                  選択した属性をエクスポート
                </MenuItem>
              </Menu>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateNew}
          >
            新規作成
          </Button>
        </Box>
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
        <>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={selectedSchemas.length === schemas.length}
              indeterminate={selectedSchemas.length > 0 && selectedSchemas.length < schemas.length}
              onChange={handleToggleSelectAll}
            />
            <Typography variant="body2">
              {selectedSchemas.length > 0 
                ? `${selectedSchemas.length}個の属性を選択中` 
                : '属性を選択'}
            </Typography>
          </Box>

          <List>
            {schemas.map((schema, index) => (
              <React.Fragment key={schema.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <Checkbox
                    checked={selectedSchemas.includes(schema.id)}
                    onChange={() => handleToggleSelect(schema.id)}
                    edge="start"
                    sx={{ mr: 1 }}
                  />
                  <ListItemText
                    primary={schema.name}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="個別エクスポート">
                      <IconButton
                        edge="end"
                        aria-label="export"
                        onClick={() => {
                          setSelectedSchemas([schema.id]);
                          setExportDialogOpen(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <FileDownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="編集">
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => onEdit(schema.id)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="削除">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleOpenDeleteDialog(schema.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </>
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

      {/* 選択した属性のエクスポートダイアログ */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        attributeSchemas={schemas}
        selectedAttributeIds={selectedSchemas}
      />

      {/* すべての属性のエクスポートダイアログ */}
      <ExportDialog
        open={exportAllDialogOpen}
        onClose={() => setExportAllDialogOpen(false)}
        attributeSchemas={schemas}
      />

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