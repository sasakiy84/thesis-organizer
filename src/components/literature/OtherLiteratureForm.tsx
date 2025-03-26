import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
} from '@mui/material';

interface OtherLiteratureData {
  sourceType?: string;
  source?: string;
  url?: string;
}

interface OtherLiteratureFormProps {
  data: Partial<OtherLiteratureData>;
  onChange: (data: Partial<OtherLiteratureData>) => void;
  errors: Record<string, string>;
}

const OtherLiteratureForm: React.FC<OtherLiteratureFormProps> = ({ data, onChange, errors }) => {
  // 入力値の変更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        その他の文献の詳細情報
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="文献タイプ"
            name="sourceType"
            value={data.sourceType || ''}
            onChange={handleChange}
            error={!!errors.sourceType}
            helperText={errors.sourceType || '例: 報告書、ウェブページ、新聞記事など'}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="出典"
            name="source"
            value={data.source || ''}
            onChange={handleChange}
            error={!!errors.source}
            helperText={errors.source || '情報源や発行元などについて記載してください'}
          />
        </Grid>

        <Grid item xs={12}>
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
      </Grid>
    </Box>
  );
};

export default OtherLiteratureForm;