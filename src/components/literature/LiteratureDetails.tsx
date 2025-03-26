import type React from 'react';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Link,
  IconButton,
  Stack,
  Alert,
  Card,
  CardContent,
  Tooltip,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import { Literature, AttributeSchema } from '../../types';

// 文献タイプの日本語表示
const LITERATURE_TYPE_LABELS: Record<string, string> = {
  journal_article: '学術論文',
  conference_paper: '会議論文',
  book: '書籍',
  book_chapter: '書籍の章',
  thesis: '学位論文',
  other: 'その他',
};

// 学位論文タイプの日本語表示
const THESIS_TYPE_LABELS: Record<string, string> = {
  doctoral: '博士論文',
  masters: '修士論文',
  bachelors: '学士論文',
};

interface LiteratureDetailsProps {
  literatureId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

const LiteratureDetails: React.FC<LiteratureDetailsProps> = ({ 
  literatureId, 
  onBack,
  onEdit 
}) => {
  const [literature, setLiterature] = useState<Literature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attributeDetails, setAttributeDetails] = useState<Record<string, AttributeSchema>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // 論文データの読み込み
  useEffect(() => {
    const loadLiterature = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await window.projectAPI.loadLiterature(literatureId);
        if (data) {
          setLiterature(data);
          
          // 属性情報がある場合は詳細を読み込む
          if (data.attributes && data.attributes.length > 0) {
            await loadAttributeDetails(data.attributes.map(attr => attr.attributeId));
          }
        } else {
          setError('論文データが見つかりませんでした');
        }
      } catch (err) {
        console.error('論文データの読み込みに失敗しました:', err);
        setError('論文データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadLiterature();
  }, [literatureId]);

  // 属性詳細の読み込み
  const loadAttributeDetails = async (attributeIds: string[]) => {
    const detailsMap: Record<string, AttributeSchema> = {};
    
    await Promise.all(
      attributeIds.map(async (id) => {
        try {
          const schema = await window.projectAPI.loadAttributeSchema(id);
          if (schema) {
            detailsMap[id] = schema;
          }
        } catch (err) {
          console.error(`属性スキーマ ID: ${id} の読み込みに失敗しました:`, err);
        }
      })
    );
    
    setAttributeDetails(detailsMap);
  };

  // 型別の詳細情報を表示
  const renderTypeSpecificDetails = () => {
    if (!literature) return null;

    switch (literature.type) {
      case 'journal_article':
        return (
          <Grid container spacing={2}>
            {literature.journal && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">ジャーナル名:</Typography>
                <Typography variant="body1">{literature.journal}</Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Box>
                {literature.volume && (
                  <Typography variant="body2">
                    <strong>巻:</strong> {literature.volume}
                  </Typography>
                )}
                {literature.issue && (
                  <Typography variant="body2">
                    <strong>号:</strong> {literature.issue}
                  </Typography>
                )}
                {literature.pages && (
                  <Typography variant="body2">
                    <strong>ページ:</strong> {literature.pages}
                  </Typography>
                )}
              </Box>
            </Grid>
            {literature.publisher && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">出版社:</Typography>
                <Typography variant="body1">{literature.publisher}</Typography>
              </Grid>
            )}
            {literature.doi && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">DOI:</Typography>
                <Typography variant="body1">
                  <Link href={`https://doi.org/${literature.doi}`} target="_blank" rel="noopener">
                    {literature.doi}
                  </Link>
                </Typography>
              </Grid>
            )}
            {literature.url && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">URL:</Typography>
                <Typography variant="body1">
                  <Link href={literature.url} target="_blank" rel="noopener">
                    {literature.url}
                  </Link>
                </Typography>
              </Grid>
            )}
          </Grid>
        );
      
      case 'conference_paper':
        return (
          <Grid container spacing={2}>
            {literature.conference && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">会議名:</Typography>
                <Typography variant="body1">{literature.conference}</Typography>
              </Grid>
            )}
            {literature.location && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">開催地:</Typography>
                <Typography variant="body1">{literature.location}</Typography>
              </Grid>
            )}
            {literature.pages && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">ページ:</Typography>
                <Typography variant="body1">{literature.pages}</Typography>
              </Grid>
            )}
            {literature.publisher && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">出版社:</Typography>
                <Typography variant="body1">{literature.publisher}</Typography>
              </Grid>
            )}
            {literature.doi && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">DOI:</Typography>
                <Typography variant="body1">
                  <Link href={`https://doi.org/${literature.doi}`} target="_blank" rel="noopener">
                    {literature.doi}
                  </Link>
                </Typography>
              </Grid>
            )}
            {literature.url && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">URL:</Typography>
                <Typography variant="body1">
                  <Link href={literature.url} target="_blank" rel="noopener">
                    {literature.url}
                  </Link>
                </Typography>
              </Grid>
            )}
          </Grid>
        );
      
      case 'book':
        return (
          <Grid container spacing={2}>
            {literature.publisher && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">出版社:</Typography>
                <Typography variant="body1">{literature.publisher}</Typography>
              </Grid>
            )}
            {literature.isbn && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">ISBN:</Typography>
                <Typography variant="body1">{literature.isbn}</Typography>
              </Grid>
            )}
            {literature.edition && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">版:</Typography>
                <Typography variant="body1">{literature.edition}</Typography>
              </Grid>
            )}
            {literature.totalPages && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">総ページ数:</Typography>
                <Typography variant="body1">{literature.totalPages}</Typography>
              </Grid>
            )}
          </Grid>
        );
      
      case 'book_chapter':
        return (
          <Grid container spacing={2}>
            {literature.bookTitle && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">書籍タイトル:</Typography>
                <Typography variant="body1">{literature.bookTitle}</Typography>
              </Grid>
            )}
            {literature.publisher && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">出版社:</Typography>
                <Typography variant="body1">{literature.publisher}</Typography>
              </Grid>
            )}
            {literature.chapter && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">章:</Typography>
                <Typography variant="body1">{literature.chapter}</Typography>
              </Grid>
            )}
            {literature.pages && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">ページ:</Typography>
                <Typography variant="body1">{literature.pages}</Typography>
              </Grid>
            )}
            {literature.isbn && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">ISBN:</Typography>
                <Typography variant="body1">{literature.isbn}</Typography>
              </Grid>
            )}
            {literature.editors && literature.editors.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">編集者:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {literature.editors.map((editor, index) => (
                    <Chip key={index} label={editor} size="small" variant="outlined" />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        );
      
      case 'thesis':
        return (
          <Grid container spacing={2}>
            {literature.thesisType && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">種類:</Typography>
                <Typography variant="body1">
                  {THESIS_TYPE_LABELS[literature.thesisType] || literature.thesisType}
                </Typography>
              </Grid>
            )}
            {literature.institution && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">機関:</Typography>
                <Typography variant="body1">{literature.institution}</Typography>
              </Grid>
            )}
            {literature.department && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">学部/研究科:</Typography>
                <Typography variant="body1">{literature.department}</Typography>
              </Grid>
            )}
            {literature.url && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">URL:</Typography>
                <Typography variant="body1">
                  <Link href={literature.url} target="_blank" rel="noopener">
                    {literature.url}
                  </Link>
                </Typography>
              </Grid>
            )}
          </Grid>
        );
      
      case 'other':
        return (
          <Grid container spacing={2}>
            {literature.sourceType && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">ソースタイプ:</Typography>
                <Typography variant="body1">{literature.sourceType}</Typography>
              </Grid>
            )}
            {literature.source && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">ソース:</Typography>
                <Typography variant="body1">{literature.source}</Typography>
              </Grid>
            )}
            {literature.url && (
              <Grid item xs={12}>
                <Typography variant="subtitle2">URL:</Typography>
                <Typography variant="body1">
                  <Link href={literature.url} target="_blank" rel="noopener">
                    {literature.url}
                  </Link>
                </Typography>
              </Grid>
            )}
          </Grid>
        );
        
      default:
        return null;
    }
  };

  // 属性情報の表示
  const renderAttributes = () => {
    if (!literature || !literature.attributes || literature.attributes.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          属性が設定されていません
        </Typography>
      );
    }

    return literature.attributes.map((attr) => {
      const schema = attributeDetails[attr.attributeId];
      if (!schema) return null;

      return (
        <Card key={attr.attributeId} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2">{schema.name}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
              {attr.values.map((value, index) => (
                <Chip key={index} label={value} size="small" color="primary" variant="outlined" />
              ))}
            </Box>
            {attr.note && (
              <Typography variant="body2" color="text.secondary">
                メモ: {attr.note}
              </Typography>
            )}
          </CardContent>
        </Card>
      );
    });
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, width: '100%', mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, width: '100%', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          一覧に戻る
        </Button>
      </Paper>
    );
  }

  if (!literature) {
    return (
      <Paper elevation={3} sx={{ p: 3, width: '100%', mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          論文データが見つかりませんでした
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          一覧に戻る
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, width: '100%', mt: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          一覧に戻る
        </Button>
        <Box>
          <Tooltip title="JSONファイルを開く">
            <IconButton
              color="primary"
              onClick={async () => {
                try {
                  const result = await window.projectAPI.openJsonFile(literatureId);
                  if (!result.success) {
                    setSnackbar({
                      open: true,
                      message: `JSONファイルを開けませんでした: ${result.error || '不明なエラー'}`,
                      severity: 'error'
                    });
                  }
                } catch (err) {
                  console.error('JSONファイルを開く際にエラーが発生しました:', err);
                  setSnackbar({
                    open: true,
                    message: 'JSONファイルを開く際にエラーが発生しました',
                    severity: 'error'
                  });
                }
              }}
              sx={{ mr: 1 }}
            >
              <CodeIcon />
            </IconButton>
          </Tooltip>
          <Button
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => onEdit(literatureId)}
          >
            編集
          </Button>
        </Box>
      </Box>

      {/* タイトルと基本情報 */}
      <Typography variant="h5" gutterBottom>
        {literature.title}
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Chip 
          label={LITERATURE_TYPE_LABELS[literature.type] || literature.type}
          color="primary" 
          size="small"
          sx={{ mr: 1 }} 
        />
        <Chip label={`${literature.year}年`} size="small" sx={{ mr: 1 }} />
      </Box>
      
      {/* 著者情報 */}
      <Typography variant="subtitle1" gutterBottom>
        著者
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {literature.authors.map((author, index) => (
          <Chip key={index} label={author} variant="outlined" />
        ))}
      </Box>
      
      {/* 論文タイプ別の詳細情報 */}
      <Typography variant="subtitle1" gutterBottom>
        詳細情報
      </Typography>
      <Box sx={{ mb: 3 }}>
        {renderTypeSpecificDetails()}
      </Box>
      
      {/* PDF情報 */}
      {literature.pdfFilePath && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            PDFファイル
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Tooltip title="クリックでPDFを開く">
              <Card
                variant="outlined"
                sx={{ 
                  flexGrow: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={async () => {
                  try {
                    const result = await window.projectAPI.openPdfFile(literature.pdfFilePath);
                    if (!result.success) {
                      setSnackbar({
                        open: true,
                        message: `PDFファイルを開けませんでした: ${result.error || '不明なエラー'}`,
                        severity: 'error'
                      });
                    }
                  } catch (err) {
                    console.error('PDFファイルを開く際にエラーが発生しました:', err);
                    setSnackbar({
                      open: true,
                      message: 'PDFファイルを開く際にエラーが発生しました',
                      severity: 'error'
                    });
                  }
                }}
              >
                <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PictureAsPdfIcon color="error" />
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {literature.pdfFilePath}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Tooltip>
            
            <Tooltip title="パスをコピー">
              <IconButton
                size="small"
                onClick={async () => {
                  try {
                    const result = await window.projectAPI.copyToClipboard(literature.pdfFilePath);
                    if (result.success) {
                      setSnackbar({
                        open: true,
                        message: 'パスをクリップボードにコピーしました',
                        severity: 'success'
                      });
                    } else {
                      setSnackbar({
                        open: true,
                        message: `コピーに失敗しました: ${result.error || '不明なエラー'}`,
                        severity: 'error'
                      });
                    }
                  } catch (err) {
                    console.error('クリップボードへのコピーに失敗しました:', err);
                    setSnackbar({
                      open: true,
                      message: 'クリップボードへのコピーに失敗しました',
                      severity: 'error'
                    });
                  }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="絶対パスをコピー">
              <IconButton
                size="small"
                onClick={async () => {
                  try {
                    // 絶対パスを取得
                    const pathResult = await window.projectAPI.getAbsolutePath(literature.pdfFilePath);
                    
                    if (pathResult.success && pathResult.path) {
                      // クリップボードにコピー
                      const copyResult = await window.projectAPI.copyToClipboard(pathResult.path);
                      
                      if (copyResult.success) {
                        setSnackbar({
                          open: true,
                          message: '絶対パスをクリップボードにコピーしました',
                          severity: 'success'
                        });
                      } else {
                        throw new Error(copyResult.error);
                      }
                    } else {
                      throw new Error(pathResult.error);
                    }
                  } catch (err) {
                    console.error('絶対パスのコピーに失敗しました:', err);
                    setSnackbar({
                      open: true,
                      message: `絶対パスのコピーに失敗しました: ${err.message || '不明なエラー'}`,
                      severity: 'error'
                    });
                  }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
      
      {/* 属性情報 */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" gutterBottom>
        属性
      </Typography>
      <Box sx={{ mb: 3 }}>
        {renderAttributes()}
      </Box>
      
      {/* メモ */}
      {literature.notes && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            メモ
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {literature.notes}
          </Typography>
        </>
      )}
      
      {/* メタデータ */}
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2} sx={{ mt: 1, color: 'text.secondary', fontSize: '0.8rem' }}>
        {literature.createdAt && (
          <Grid item xs={12} sm={6}>
            <Typography variant="caption">
              作成日時: {new Date(literature.createdAt).toLocaleString()}
            </Typography>
          </Grid>
        )}
        {literature.updatedAt && (
          <Grid item xs={12} sm={6}>
            <Typography variant="caption">
              更新日時: {new Date(literature.updatedAt).toLocaleString()}
            </Typography>
          </Grid>
        )}
      </Grid>
      
      {/* スナックバー */}
      <Snackbar 
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default LiteratureDetails;