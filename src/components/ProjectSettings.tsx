import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import { ProjectSettings, ProjectSettingsSchema } from '../types';

const ProjectSettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<ProjectSettings>({
    projectName: '',
    projectDescription: '',
    workingDir: '',
    repositoryDir: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // 保存済み設定の読み込み
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const savedSettings = await window.projectAPI.loadProjectSettings();
        if (savedSettings) {
          setSettings(savedSettings);
        }
      } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // フォーム入力の更新
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Working Directory選択ダイアログを開く
  const handleSelectWorkingDir = async () => {
    const dir = await window.projectAPI.selectWorkingDir();
    if (dir) {
      setSettings(prev => ({ ...prev, workingDir: dir }));
      
      // エラーをクリア
      if (errors.workingDir) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.workingDir;
          return newErrors;
        });
      }
    }
  };

  // Repository Directory選択ダイアログを開く
  const handleSelectRepositoryDir = async () => {
    const dir = await window.projectAPI.selectWorkingDir();
    if (dir) {
      setSettings(prev => ({ ...prev, repositoryDir: dir }));
    }
  };

  // 設定を保存
  const handleSave = async () => {
    try {
      // Zodを使ってバリデーション
      ProjectSettingsSchema.parse(settings);
      
      setIsLoading(true);
      const result = await window.projectAPI.saveProjectSettings(settings);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'プロジェクト設定を保存しました',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: `保存に失敗しました: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      if (error.errors) {
        // Zodバリデーションエラーの処理
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const path = err.path[0];
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      } else {
        setSnackbar({
          open: true,
          message: `エラーが発生しました: ${error.message}`,
          severity: 'error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, width: '100%', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        プロジェクト設定
      </Typography>

      <Box component="form" noValidate sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="プロジェクト名"
              name="projectName"
              value={settings.projectName}
              onChange={handleChange}
              error={!!errors.projectName}
              helperText={errors.projectName}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="プロジェクトの説明"
              name="projectDescription"
              value={settings.projectDescription}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                label="Working Directory"
                name="workingDir"
                value={settings.workingDir}
                onChange={handleChange}
                error={!!errors.workingDir}
                helperText={errors.workingDir || 'プロジェクトデータを保存するフォルダを選択してください'}
                required
                sx={{ mr: 2 }}
              />
              <Button 
                variant="outlined" 
                onClick={handleSelectWorkingDir}
                disabled={isLoading}
              >
                選択
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                label="Repository Directory"
                name="repositoryDir"
                value={settings.repositoryDir}
                onChange={handleChange}
                helperText="論文PDFファイルが保存されているフォルダを選択してください（オプション）"
                sx={{ mr: 2 }}
              />
              <Button 
                variant="outlined" 
                onClick={handleSelectRepositoryDir}
                disabled={isLoading}
              >
                選択
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isLoading}
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

export default ProjectSettingsForm;