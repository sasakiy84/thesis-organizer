import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  IconButton,
  Chip,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { AttributeSchema, AttributeValue, AttributeValueSchema } from '../../types';

interface AttributeSchemaFormProps {
  initialData?: AttributeSchema;
  onSave: (schema: AttributeSchema) => void;
  onCancel: () => void;
}

const AttributeSchemaForm: React.FC<AttributeSchemaFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  // 初期データの処理
  const emptySchema: Omit<AttributeSchema, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    description: '',
    predefinedValues: [],
    allowFreeText: false,
  };

  // 状態
  const [formData, setFormData] = useState<Omit<AttributeSchema, 'id' | 'createdAt' | 'updatedAt'>>({
    ...emptySchema,
    ...(initialData ? {
      name: initialData.name,
      description: initialData.description || '',
      predefinedValues: initialData.predefinedValues || [],
      allowFreeText: initialData.allowFreeText || false,
    } : {})
  });

  const [newValueText, setNewValueText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 一時IDを生成（保存時にサーバー側で正式なIDに置き換えられる）
  const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  // 入力値の変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 属性値の追加
  const handleAddValue = () => {
    if (newValueText.trim()) {
      const newValue: AttributeValue = {
        id: generateTempId(),
        value: newValueText.trim(),
      };

      setFormData(prev => ({
        ...prev,
        predefinedValues: [...(prev.predefinedValues || []), newValue]
      }));
      setNewValueText('');
    }
  };

  // Enterキーで属性値を追加
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newValueText.trim()) {
      e.preventDefault();
      handleAddValue();
    }
  };

  // 属性値の削除
  const handleDeleteValue = (id: string) => {
    setFormData(prev => ({
      ...prev,
      predefinedValues: (prev.predefinedValues || []).filter(val => val.id !== id)
    }));
  };

  // フォーム送信
  const handleSubmit = () => {
    // バリデーション
    const validationErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      validationErrors.name = '属性名は必須です';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // 送信データの作成
      const schemaData: AttributeSchema = {
        id: initialData?.id || '',
        name: formData.name.trim(),
        description: formData.description.trim(),
        predefinedValues: formData.predefinedValues || [],
        allowFreeText: formData.allowFreeText,
        createdAt: initialData?.createdAt || '',
        updatedAt: '',
      };

      // 保存処理を呼び出し
      onSave(schemaData);
    } catch (error) {
      console.error('属性スキーマ保存エラー:', error);
      setSnackbar({
        open: true,
        message: `エラーが発生しました: ${error.message || '不明なエラー'}`,
        severity: 'error',
      });
    }
  };

  // Snackbarを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, width: '100%', mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? '属性定義を編集' : '新しい属性定義を作成'}
      </Typography>

      <Box component="form" noValidate sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="属性名"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="説明"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.allowFreeText}
                  onChange={handleChange}
                  name="allowFreeText"
                  color="primary"
                />
              }
              label="自由入力を許可"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              選択肢
            </Typography>
            <TextField
              fullWidth
              label="新しい選択肢を追加"
              value={newValueText}
              onChange={(e) => setNewValueText(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleAddValue}
                      disabled={!newValueText.trim()}
                      edge="end"
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="選択肢を入力しEnterキーまたは+ボタンをクリックして追加してください"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(formData.predefinedValues || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  選択肢がまだ追加されていません
                </Typography>
              ) : (
                formData.predefinedValues?.map((value) => (
                  <Chip
                    key={value.id}
                    label={value.value}
                    onDelete={() => handleDeleteValue(value.id)}
                    color="primary"
                    variant="outlined"
                  />
                ))
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
            >
              キャンセル
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
            >
              保存
            </Button>
          </Grid>
        </Grid>
      </Box>

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

export default AttributeSchemaForm;