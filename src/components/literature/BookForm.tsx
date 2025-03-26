import type React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
} from '@mui/material';

interface BookData {
  publisher: string;
  isbn?: string;
  edition?: string;
  totalPages?: number;
}

interface BookFormProps {
  data: Partial<BookData>;
  onChange: (data: Partial<BookData>) => void;
  errors: Record<string, string>;
}

const BookForm: React.FC<BookFormProps> = ({ data, onChange, errors }) => {
  // 入力値の変更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 総ページ数は数値に変換
    if (name === 'totalPages') {
      onChange({ [name]: value ? parseInt(value, 10) : undefined });
    } else {
      onChange({ [name]: value });
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        書籍の詳細情報
      </Typography>
      <Grid container spacing={2}>
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

        <Grid item xs={12} sm={6}>
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

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="版"
            name="edition"
            value={data.edition || ''}
            onChange={handleChange}
            error={!!errors.edition}
            helperText={errors.edition || 'e.g. 第2版、Second Edition'}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="総ページ数"
            name="totalPages"
            type="number"
            value={data.totalPages || ''}
            onChange={handleChange}
            error={!!errors.totalPages}
            helperText={errors.totalPages}
            inputProps={{ min: 1 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookForm;