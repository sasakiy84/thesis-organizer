import { createRoot } from 'react-dom/client';
import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ProjectSettingsForm from './components/ProjectSettings';

// アプリケーションのテーマを設定
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// アプリケーションのルートコンポーネント
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ padding: '20px' }}>
        <ProjectSettingsForm />
      </div>
    </ThemeProvider>
  );
};

// Reactをレンダリング
const container = document.getElementById('root') || document.body;
const root = createRoot(container);
root.render(<App />);