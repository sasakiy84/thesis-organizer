import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

interface ThesisData {
  thesisType: 'doctoral' | 'masters' | 'bachelors';
  institution: string;
  department?: string;
  url?: string;
}

interface ThesisFormProps {
  data: Partial<ThesisData>;
  onChange: (data: Partial<ThesisData>) => void;
  errors: Record<string, string>;
}

const ThesisForm: React.FC<ThesisFormProps> = ({ data, onChange, errors }) => {
  // 入力値の変更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  // 論文タイプの変更
  const handleTypeChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    onChange({ thesisType: e.target.value as 'doctoral' | 'masters' | 'bachelors' });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        学位論文の詳細情報
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.thesisType}>
            <InputLabel id="thesis-type-label">論文タイプ</InputLabel>
            <Select
              labelId="thesis-type-label"
              name="thesisType"
              value={data.thesisType || ''}
              onChange={handleTypeChange}
              label="論文タイプ"
            >
              <MenuItem value="doctoral">博士論文</MenuItem>
              <MenuItem value="masters">修士論文</MenuItem>
              <MenuItem value="bachelors">学士論文</MenuItem>
            </Select>
            {errors.thesisType && (
              <Typography color="error" variant="caption">
                {errors.thesisType}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="大学・研究機関"
            name="institution"
            value={data.institution || ''}
            onChange={handleChange}
            error={!!errors.institution}
            helperText={errors.institution}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="学部・研究科"
            name="department"
            value={data.department || ''}
            onChange={handleChange}
            error={!!errors.department}
            helperText={errors.department}
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
      </Grid>
    </Box>
  );
};

export default ThesisForm;