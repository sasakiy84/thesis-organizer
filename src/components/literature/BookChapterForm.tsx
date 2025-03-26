import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface BookChapterData {
  bookTitle: string;
  publisher: string;
  editors?: string[];
  chapter?: string;
  pages?: string;
  isbn?: string;
}

interface BookChapterFormProps {
  data: Partial<BookChapterData>;
  onChange: (data: Partial<BookChapterData>) => void;
  errors: Record<string, string>;
}

const BookChapterForm: React.FC<BookChapterFormProps> = ({ data, onChange, errors }) => {
  const [newEditor, setNewEditor] = useState('');

  // 入力値の変更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  // 編集者を追加
  const handleAddEditor = () => {
    if (newEditor.trim()) {
      const editors = data.editors || [];
      onChange({ editors: [...editors, newEditor.trim()] });
      setNewEditor('');
    }
  };

  // Enterキーで編集者を追加
  const handleEditorKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newEditor.trim()) {
      e.preventDefault();
      handleAddEditor();
    }
  };

  // 編集者を削除
  const handleDeleteEditor = (index: number) => {
    const editors = [...(data.editors || [])];
    editors.splice(index, 1);
    onChange({ editors });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        書籍の章の詳細情報
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="書籍タイトル"
            name="bookTitle"
            value={data.bookTitle || ''}
            onChange={handleChange}
            error={!!errors.bookTitle}
            helperText={errors.bookTitle}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="出版社"
            name="publisher"
            value={data.publisher || ''}
            onChange={handleChange}
            error={!!errors.publisher}
            helperText={errors.publisher}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="編集者を追加"
            value={newEditor}
            onChange={(e) => setNewEditor(e.target.value)}
            onKeyPress={handleEditorKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleAddEditor}
                    disabled={!newEditor.trim()}
                    edge="end"
                  >
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="編集者名を入力しEnterキーまたは+ボタンをクリックして追加してください"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {!data.editors || data.editors.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                編集者が追加されていません
              </Typography>
            ) : (
              data.editors.map((editor, index) => (
                <Chip
                  key={index}
                  label={editor}
                  onDelete={() => handleDeleteEditor(index)}
                  color="primary"
                  variant="outlined"
                />
              ))
            )}
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="章番号"
            name="chapter"
            value={data.chapter || ''}
            onChange={handleChange}
            error={!!errors.chapter}
            helperText={errors.chapter}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="ページ範囲"
            name="pages"
            value={data.pages || ''}
            onChange={handleChange}
            error={!!errors.pages}
            helperText={errors.pages || 'e.g. 123-145'}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="ISBN"
            name="isbn"
            value={data.isbn || ''}
            onChange={handleChange}
            error={!!errors.isbn}
            helperText={errors.isbn}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookChapterForm;