import type React from 'react';
import { useState, useEffect, useMemo, useDeferredValue } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Button,
  IconButton,
  TextField,
  Grid,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface LiteratureItem {
  id: string;
  title: string;
  type: string;
  year: number;
  authors?: string[]; // 著者も追加
}

// 文献タイプの日本語表示
const LITERATURE_TYPE_LABELS: Record<string, string> = {
  journal_article: '学術論文',
  conference_paper: '会議論文',
  book: '書籍',
  book_chapter: '書籍の章',
  thesis: '学位論文',
  other: 'その他',
};

interface LiteratureListProps {
  onAddNew: () => void;
  onEdit: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const LiteratureList: React.FC<LiteratureListProps> = ({ onAddNew, onEdit, onViewDetails }) => {
  const [literatures, setLiteratures] = useState<LiteratureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  
  // 検索フィルター用の状態
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchYear, setSearchYear] = useState('');
  
  // 遅延評価された検索値（UIの応答性を維持しながら重い処理を遅延させる）
  const deferredSearchTitle = useDeferredValue(searchTitle);
  const deferredSearchAuthor = useDeferredValue(searchAuthor);
  const deferredSearchYear = useDeferredValue(searchYear);

  // 論文一覧の取得
  const loadLiteratures = async () => {
    setLoading(true);
    try {
      const items = await window.projectAPI.listLiteratures();
      setLiteratures(items);
    } catch (error) {
      console.error('論文一覧の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントマウント時に論文一覧を取得
  useEffect(() => {
    loadLiteratures();
  }, []);

  // ページ変更時に最初のページに戻す（検索条件変更時）
  useEffect(() => {
    setPage(0);
  }, [deferredSearchTitle, deferredSearchAuthor, deferredSearchYear]);

  // ページ変更ハンドラ
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // 1ページあたりの行数変更ハンドラ
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 文献タイプの表示名を取得
  const getLiteratureTypeLabel = (type: string) => {
    return LITERATURE_TYPE_LABELS[type] || type;
  };

  // 検索条件をリセットするハンドラ
  const handleResetSearch = () => {
    setSearchTitle('');
    setSearchAuthor('');
    setSearchYear('');
  };

  // 検索条件に基づいてフィルタリングされた論文一覧
  const filteredLiteratures = useMemo(() => {
    return literatures.filter(item => {
      // タイトルでフィルタリング
      const matchesTitle = !deferredSearchTitle || 
        item.title.toLowerCase().includes(deferredSearchTitle.toLowerCase());
      
      // 著者でフィルタリング（著者情報がある場合のみ）
      const matchesAuthor = !deferredSearchAuthor || 
        (item.authors && item.authors.some(author => 
          author.toLowerCase().includes(deferredSearchAuthor.toLowerCase())
        ));
      
      // 出版年でフィルタリング
      const matchesYear = !deferredSearchYear || 
        item.year.toString().includes(deferredSearchYear);
      
      return matchesTitle && matchesAuthor && matchesYear;
    });
  }, [literatures, deferredSearchTitle, deferredSearchAuthor, deferredSearchYear]);

  // 空の状態を表示
  const renderEmptyState = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        論文データがまだ登録されていません
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddNew}
        sx={{ mt: 2 }}
      >
        論文を追加
      </Button>
    </Box>
  );

  // ローディング状態を表示
  const renderLoading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress />
    </Box>
  );

  // 検索条件入力フォームを表示
  const renderSearchForm = () => (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="タイトルで検索"
            variant="outlined"
            size="small"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTitle && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTitle('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="著者で検索"
            variant="outlined"
            size="small"
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchAuthor && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchAuthor('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="出版年で検索"
            variant="outlined"
            size="small"
            value={searchYear}
            onChange={(e) => setSearchYear(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchYear && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchYear('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      {(searchTitle || searchAuthor || searchYear) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, alignItems: 'center' }}>
          {deferredSearchTitle !== searchTitle || deferredSearchAuthor !== searchAuthor || deferredSearchYear !== searchYear ? (
            <Typography variant="caption" color="text.secondary">
              検索結果を更新中...
            </Typography>
          ) : (
            <Box />
          )}
          <Button 
            variant="text" 
            size="small" 
            onClick={handleResetSearch}
            startIcon={<ClearIcon />}
          >
            検索条件をクリア
          </Button>
        </Box>
      )}
    </Box>
  );

  // 論文一覧テーブルを表示
  const renderLiteratureTable = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredLiteratures.length}件の論文が見つかりました
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddNew}
        >
          論文を追加
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>タイトル</TableCell>
              <TableCell>タイプ</TableCell>
              <TableCell>出版年</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLiteratures
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow 
                  key={item.id} 
                  hover 
                  onClick={() => onViewDetails(item.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{getLiteratureTypeLabel(item.type)}</TableCell>
                  <TableCell>{item.year}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation(); // 親要素のクリックイベントを防止
                        onEdit(item.id);
                      }}
                      aria-label="編集"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[25, 100, 200]}
        component="div"
        count={filteredLiteratures.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="表示件数:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </>
  );

  return (
    <Paper elevation={3} sx={{ p: 3, width: '100%', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        論文一覧
      </Typography>

      {loading ? (
        renderLoading()
      ) : literatures.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {renderSearchForm()}
          {renderLiteratureTable()}
        </>
      )}
    </Paper>
  );
};

export default LiteratureList;