import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

interface LiteratureItem {
  id: string;
  title: string;
  type: string;
  year: number;
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
}

const LiteratureList: React.FC<LiteratureListProps> = ({ onAddNew, onEdit }) => {
  const [literatures, setLiteratures] = useState<LiteratureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  // 論文一覧テーブルを表示
  const renderLiteratureTable = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
            {literatures
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{getLiteratureTypeLabel(item.type)}</TableCell>
                  <TableCell>{item.year}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(item.id)}
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
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={literatures.length}
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
        renderLiteratureTable()
      )}
    </Paper>
  );
};

export default LiteratureList;