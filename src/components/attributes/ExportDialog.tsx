import type React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Typography,
  Divider,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import type { ExportField } from '../../types';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  attributeSchemas: { id: string; name: string }[];
  selectedAttributeIds?: string[]; // nullの場合は全属性が選択されていると見なす
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  attributeSchemas,
  selectedAttributeIds,
}) => {
  // 状態
  const [format, setFormat] = useState<'csv' | 'tsv'>('csv');
  const [selectedFields, setSelectedFields] = useState<ExportField[]>(['id', 'attribute', 'value']);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 利用可能なフィールド
  const availableFields: { value: ExportField; label: string }[] = [
    { value: 'id', label: 'ID' },
    { value: 'title', label: 'タイトル' },
    { value: 'year', label: '年' },
    { value: 'authors', label: '著者' },
    { value: 'filename', label: 'ファイル名' },
    { value: 'filepath', label: 'ファイルパス' },
    { value: 'attribute', label: '属性名' },
    { value: 'value', label: '属性値' },
  ];

  // フィールド選択の変更ハンドラ
  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as ExportField;
    const checked = event.target.checked;

    if (checked) {
      // 'attribute'を選んだ場合は'value'も自動選択、'value'を選んだ場合は'attribute'も自動選択
      if (field === 'attribute' && !selectedFields.includes('value')) {
        setSelectedFields(prev => [...prev, field, 'value']);
      } else if (field === 'value' && !selectedFields.includes('attribute')) {
        setSelectedFields(prev => [...prev, 'attribute', field]);
      } else {
        setSelectedFields(prev => [...prev, field]);
      }
    } else {
      // 'attribute'のチェックを外した場合は'value'も連動して外す、その逆も同様
      if (field === 'attribute') {
        setSelectedFields(prev => prev.filter(f => f !== field && f !== 'value'));
      } else if (field === 'value') {
        setSelectedFields(prev => prev.filter(f => f !== field && f !== 'attribute'));
      } else {
        setSelectedFields(prev => prev.filter(f => f !== field));
      }
    }
  };

  // フォーマット選択の変更ハンドラ
  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(event.target.value as 'csv' | 'tsv');
  };

  // エクスポート処理
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);

      // エクスポート設定
      const exportConfig = {
        format,
        fields: selectedFields,
        attributeIds: selectedAttributeIds,
      };

      // 属性情報をエクスポート
      const result = await window.projectAPI.exportAttributes(exportConfig);

      if (!result.success) {
        throw new Error(result.error || 'エクスポートに失敗しました');
      }

      // ファイルとして保存
      const saveResult = await window.projectAPI.saveExportFile(result.data, format);

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'ファイルの保存に失敗しました');
      }

      // ダイアログを閉じる
      onClose();
    } catch (error) {
      console.error('エクスポート処理中にエラーが発生しました:', error);
      setError(error.message || '予期せぬエラーが発生しました');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>属性情報のエクスポート</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle1" gutterBottom>
          エクスポート設定
        </Typography>

        {/* ファイル形式選択 */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">ファイル形式</FormLabel>
          <RadioGroup row value={format} onChange={handleFormatChange}>
            <FormControlLabel value="csv" control={<Radio />} label="CSV (.csv)" />
            <FormControlLabel value="tsv" control={<Radio />} label="TSV (.tsv)" />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* フィールド選択 */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">エクスポートするフィールド</FormLabel>
          <FormGroup row>
            {availableFields.map((field) => (
              <FormControlLabel
                key={field.value}
                control={
                  <Checkbox
                    checked={selectedFields.includes(field.value)}
                    onChange={handleFieldChange}
                    name={field.value}
                  />
                }
                label={field.label}
              />
            ))}
          </FormGroup>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            *「属性名」と「属性値」は連動して選択・解除されます。tidy data形式のエクスポートでは両方が必要です。
          </Typography>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* 対象属性の情報 */}
        <Typography variant="subtitle1" gutterBottom>
          エクスポート対象の属性
        </Typography>
        {selectedAttributeIds && selectedAttributeIds.length > 0 ? (
          <Typography variant="body2">
            {attributeSchemas
              .filter(schema => selectedAttributeIds.includes(schema.id))
              .map(schema => schema.name)
              .join(', ')}
          </Typography>
        ) : (
          <Typography variant="body2">すべての属性</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          キャンセル
        </Button>
        <Button
          onClick={handleExport}
          color="primary"
          variant="contained"
          disabled={isExporting || selectedFields.length === 0}
        >
          {isExporting ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              エクスポート中...
            </Box>
          ) : (
            'エクスポート'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;