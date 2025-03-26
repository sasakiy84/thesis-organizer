import type React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
} from '@mui/material';

interface ConferencePaperData {
  conference: string;
  location?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
}

interface ConferencePaperFormProps {
  data: Partial<ConferencePaperData>;
  onChange: (data: Partial<ConferencePaperData>) => void;
  errors: Record<string, string>;
}

const ConferencePaperForm: React.FC<ConferencePaperFormProps> = ({ data, onChange, errors }) => {
  // 入力値の変更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        会議論文の詳細情報
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="会議名"
            name="conference"
            value={data.conference || ''}
            onChange={handleChange}
            error={!!errors.conference}
            helperText={errors.conference}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="開催地"
            name="location"
            value={data.location || ''}
            onChange={handleChange}
            error={!!errors.location}
            helperText={errors.location}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
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
            label="出版社またはプロシーディングス"
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

export default ConferencePaperForm;