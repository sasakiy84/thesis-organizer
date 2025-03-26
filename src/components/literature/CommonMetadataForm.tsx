import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import { AttributeApplication } from '../../types';
import AttributeSelector from '../attributes/AttributeSelector';

interface CommonFormData {
  title: string;
  year: number;
  authors: string[];
  notes?: string;
  pdfFilePath?: string;
  attributes?: AttributeApplication[];
}

interface CommonMetadataFormProps {
  data: CommonFormData;
  onChange: (data: Partial<CommonFormData>) => void;
  errors: Record<string, string>;
  onSelectPdf: () => void;
}

const CommonMetadataForm: React.FC<CommonMetadataFormProps> = ({
  data,
  onChange,
  errors,
  onSelectPdf,
}) => {
  const [newAuthor, setNewAuthor] = useState('');

  // 入力値の変更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 年は数値に変換
    if (name === 'year') {
      onChange({ [name]: parseInt(value, 10) || new Date().getFullYear() });
    } else {
      onChange({ [name]: value });
    }
  };

  // 著者を追加
  const handleAddAuthor = () => {
    if (newAuthor.trim()) {
      const updatedAuthors = [...data.authors, newAuthor.trim()];
      onChange({ authors: updatedAuthors });
      setNewAuthor('');
    }
  };

  // Enterキーで著者を追加
  const handleAuthorKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newAuthor.trim()) {
      e.preventDefault();
      handleAddAuthor();
    }
  };

  // 著者を削除
  const handleDeleteAuthor = (index: number) => {
    const updatedAuthors = [...data.authors];
    updatedAuthors.splice(index, 1);
    onChange({ authors: updatedAuthors });
  };

  // 属性の変更
  const handleAttributesChange = (attributes: AttributeApplication[]) => {
    onChange({ attributes });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        基本情報
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="タイトル"
            name="title"
            value={data.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="出版年"
            name="year"
            type="number"
            value={data.year}
            onChange={handleChange}
            error={!!errors.year}
            helperText={errors.year}
            required
            inputProps={{ min: 1000, max: new Date().getFullYear() + 10 }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="著者を追加"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            onKeyPress={handleAuthorKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleAddAuthor}
                    disabled={!newAuthor.trim()}
                    edge="end"
                  >
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={!!errors.authors}
            helperText={errors.authors || '著者名を入力しEnterキーまたは+ボタンをクリックして追加してください'}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {data.authors.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                著者が追加されていません
              </Typography>
            ) : (
              data.authors.map((author, index) => (
                <Chip
                  key={index}
                  label={author}
                  onDelete={() => handleDeleteAuthor(index)}
                  color="primary"
                  variant="outlined"
                />
              ))
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="関連PDFファイル"
            name="pdfFilePath"
            value={data.pdfFilePath || ''}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={onSelectPdf} edge="end">
                    <FileIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="メモ"
            name="notes"
            value={data.notes || ''}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <AttributeSelector
            value={data.attributes || []}
            onChange={handleAttributesChange}
            error={errors.attributes}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommonMetadataForm;