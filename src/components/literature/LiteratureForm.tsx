import type React from 'react';
import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import type { Literature } from '../../types';
import JournalArticleForm from './JournalArticleForm';
import ConferencePaperForm from './ConferencePaperForm';
import BookForm from './BookForm';
import BookChapterForm from './BookChapterForm';
import ThesisForm from './ThesisForm';
import OtherLiteratureForm from './OtherLiteratureForm';
import CommonMetadataForm from './CommonMetadataForm';

// 利用可能な文献タイプ
const LITERATURE_TYPES = [
  { value: 'journal_article', label: '学術論文' },
  { value: 'conference_paper', label: '会議論文' },
  { value: 'book', label: '書籍' },
  { value: 'book_chapter', label: '書籍の章' },
  { value: 'thesis', label: '学位論文' },
  { value: 'other', label: 'その他' }
];

interface LiteratureFormProps {
  initialData?: Literature;
  onSave: (literature: Literature) => void;
}

const LiteratureForm: React.FC<LiteratureFormProps> = ({ initialData, onSave }) => {
  // 文献タイプ
  const [type, setType] = useState<string>(initialData?.type || '');
  
  // 初期データとして空の共通メタデータを用意
  const emptyCommonData = {
    title: '',
    year: new Date().getFullYear(),
    authors: [],
    notes: '',
  };
  
  // 共通データと追加データの状態
  const [commonData, setCommonData] = useState({
    ...emptyCommonData,
    ...(initialData ? {
      title: initialData.title,
      year: initialData.year,
      authors: initialData.authors,
      notes: initialData.notes || '',
      pdfFilePath: initialData.pdfFilePath || '',
      attributes: initialData.attributes || [],  // 属性データを明示的に初期化
    } : {})
  });
  
  // 型ごとの追加データの状態（属性情報を含む）
  const [additionalData, setAdditionalData] = useState<Record<string, any>>(() => {
    if (initialData) {
      // initialDataのクローンを作成
      return { ...initialData };
    }
    return {};
  });
  
  // エラー状態
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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

  // 文献タイプの変更
  const handleTypeChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const newType = e.target.value as string;
    setType(newType);
    
    // 型が変更されたらエラーをクリア
    setErrors({});
  };

  // 共通データの更新
  const handleCommonDataChange = (data: Partial<typeof commonData>) => {
    // 属性データが含まれる場合はコンソールに出力
    if ('attributes' in data) {
      console.log('handleCommonDataChange - 属性データの更新:', data.attributes);
    }
    
    setCommonData(prev => ({ ...prev, ...data }));
    
    // 更新されたフィールドのエラーをクリア
    const updatedFields = Object.keys(data);
    if (updatedFields.some(field => errors[field])) {
      const newErrors = { ...errors };
      updatedFields.forEach(field => {
        delete newErrors[field];
      });
      setErrors(newErrors);
    }
  };

  // 追加データの更新
  const handleAdditionalDataChange = (data: Record<string, any>) => {
    setAdditionalData(prev => ({ ...prev, ...data }));
    
    // 更新されたフィールドのエラーをクリア
    const updatedFields = Object.keys(data);
    if (updatedFields.some(field => errors[field])) {
      const newErrors = { ...errors };
      updatedFields.forEach(field => {
        delete newErrors[field];
      });
      setErrors(newErrors);
    }
  };

  // PDFファイル選択
  const handleSelectPdf = async () => {
    const filePath = await window.projectAPI.selectPdfFile();
    if (filePath) {
      handleCommonDataChange({ pdfFilePath: filePath });
    }
  };

  // フォーム送信
  const handleSubmit = async () => {
    try {
      // 文献タイプが選択されていない場合はエラー
      if (!type) {
        setErrors(prev => ({ ...prev, type: '文献タイプを選択してください' }));
        return;
      }
      
      // 属性データが共通データに含まれていることを確認
      console.log('送信前の共通データ:', commonData);
      console.log('送信前の属性データ:', commonData.attributes);
      
      // 文献データを作成（属性データの保持を確認）
      const literatureData: any = {
        ...commonData,
        ...additionalData,
        type,
        // 属性データを明示的に設定
        attributes: commonData.attributes || [],
      };
      
      // デバッグ用: 保存される文献データをコンソールに出力
      console.log('保存される文献データ:', literatureData);
      console.log('属性情報:', literatureData.attributes);
      
      // 親コンポーネントに保存を通知
      onSave(literatureData as Literature);
      
    } catch (error) {
      console.error('保存エラー:', error);
      
      if (error.errors) {
        // バリデーションエラーの処理
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const path = err.path[0];
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      } else {
        setSnackbar({
          open: true,
          message: `エラーが発生しました: ${error.message || '不明なエラー'}`,
          severity: 'error',
        });
      }
    }
  };

  // Snackbarを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // 文献タイプごとのフォームを表示
  const renderTypeSpecificForm = () => {
    switch (type) {
      case 'journal_article':
        return (
          <JournalArticleForm
            data={additionalData}
            onChange={handleAdditionalDataChange}
            errors={errors}
          />
        );
      case 'conference_paper':
        return (
          <ConferencePaperForm
            data={additionalData}
            onChange={handleAdditionalDataChange}
            errors={errors}
          />
        );
      case 'book':
        return (
          <BookForm
            data={additionalData}
            onChange={handleAdditionalDataChange}
            errors={errors}
          />
        );
      case 'book_chapter':
        return (
          <BookChapterForm
            data={additionalData}
            onChange={handleAdditionalDataChange}
            errors={errors}
          />
        );
      case 'thesis':
        return (
          <ThesisForm
            data={additionalData}
            onChange={handleAdditionalDataChange}
            errors={errors}
          />
        );
      case 'other':
        return (
          <OtherLiteratureForm
            data={additionalData}
            onChange={handleAdditionalDataChange}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, width: '100%', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? '論文情報を編集' : '新しい論文を追加'}
      </Typography>

      <Box component="form" noValidate sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel id="literature-type-label">文献タイプ</InputLabel>
              <Select
                labelId="literature-type-label"
                value={type}
                onChange={handleTypeChange}
                label="文献タイプ"
              >
                {LITERATURE_TYPES.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && (
                <Typography color="error" variant="caption">
                  {errors.type}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {type && (
            <>
              <Grid item xs={12}>
                <CommonMetadataForm
                  data={commonData}
                  onChange={handleCommonDataChange}
                  errors={errors}
                  onSelectPdf={handleSelectPdf}
                />
              </Grid>

              <Grid item xs={12}>
                {renderTypeSpecificForm()}
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                >
                  保存
                </Button>
              </Grid>
            </>
          )}
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

export default LiteratureForm;