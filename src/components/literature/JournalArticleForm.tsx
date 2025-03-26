import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
} from '@mui/material';

interface JournalArticleData {
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
}

interface JournalArticleFormProps {
  data: Partial<JournalArticleData>;
  onChange: (data: Partial<JournalArticleData>) => void;
  errors: Record<string, string>;
}

const JournalArticleForm: React.FC<JournalArticleFormProps> = ({ data, onChange, errors }) => {
  // 入力値の変更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        学術論文の詳細情報
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="ジャーナル名"
            name="journal"
            value={data.journal || ''}
            onChange={handleChange}
            error={!!errors.journal}
            helperText={errors.journal}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="巻 (Volume)"
            name="volume"
            value={data.volume || ''}
            onChange={handleChange}
            error={!!errors.volume}
            helperText={errors.volume}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="号 (Issue)"
            name="issue"
            value={data.issue || ''}
            onChange={handleChange}
            error={!!errors.issue}
            helperText={errors.issue}
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

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="DOI"
            name="doi"
            value={data.doi || ''}
            onChange={handleChange}
            error={!!errors.doi}
            helperText={errors.doi}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="URL"
            name="url"
            value={data.url || ''}
            onChange={handleChange}
            error={!!errors.url}
            helperText={errors.url}
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
      </Grid>
    </Box>
  );
};

export default JournalArticleForm;