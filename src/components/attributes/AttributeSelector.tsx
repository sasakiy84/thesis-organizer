import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  TextField,
  Button,
  InputAdornment,
  Grid,
  Paper,
  Divider,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { AttributeApplication, AttributeSchema } from '../../types';

interface AttributeSelectorProps {
  value: AttributeApplication[];
  onChange: (attributes: AttributeApplication[]) => void;
  error?: string;
}

const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  // 状態
  const [attributeSchemas, setAttributeSchemas] = useState<{ id: string; name: string }[]>([]);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>('');
  const [attributeDetails, setAttributeDetails] = useState<Record<string, AttributeSchema>>({});
  const [newValue, setNewValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 属性スキーマ一覧を取得
  const loadAttributeSchemas = async () => {
    try {
      setIsLoading(true);
      const schemas = await window.projectAPI.listAttributeSchemas();
      
      // 配列チェック
      if (Array.isArray(schemas)) {
        setAttributeSchemas(schemas);

        // 使用されている属性のスキーマを読み込む
        const usedSchemaIds = value.map(attr => attr.attributeId);
        const detailsPromises = usedSchemaIds.map(id => window.projectAPI.loadAttributeSchema(id));
        const details = await Promise.all(detailsPromises);

        const detailsMap: Record<string, AttributeSchema> = {};
        details.forEach(schema => {
          if (schema) {
            detailsMap[schema.id] = schema;
          }
        });

        setAttributeDetails(detailsMap);
      } else {
        console.error('属性スキーマ一覧が配列ではありません:', schemas);
        setAttributeSchemas([]);
      }
    } catch (error) {
      console.error('属性スキーマの読み込みに失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初期読み込み
  useEffect(() => {
    loadAttributeSchemas();
  }, []);

  // 属性の詳細情報を取得
  const loadAttributeDetail = async (id: string) => {
    if (attributeDetails[id]) return;

    try {
      const schema = await window.projectAPI.loadAttributeSchema(id);
      if (schema) {
        setAttributeDetails(prev => ({
          ...prev,
          [id]: schema
        }));
      }
    } catch (error) {
      console.error(`属性ID「${id}」の詳細情報の読み込みに失敗しました:`, error);
    }
  };

  // 属性が選択された時
  const handleAttributeSelect = async (e: React.ChangeEvent<{ value: unknown }>) => {
    const id = e.target.value as string;
    setSelectedAttributeId(id);
    
    if (id) {
      await loadAttributeDetail(id);
    }
  };

  // 選択肢が選択された時
  const handlePredefinedValueSelect = (attributeId: string, selectedValue: string) => {
    // 既に選択済みかチェック
    const existingAttr = value.find(attr => attr.attributeId === attributeId);
    
    if (existingAttr) {
      // 既に値が存在する場合は追加
      if (!existingAttr.values.includes(selectedValue)) {
        const updatedAttributes = value.map(attr => 
          attr.attributeId === attributeId
            ? { ...attr, values: [...attr.values, selectedValue] }
            : attr
        );
        onChange(updatedAttributes);
      }
    } else {
      // 新しい属性として追加
      const newAttribute: AttributeApplication = {
        attributeId,
        values: [selectedValue],
        note: '',
      };
      onChange([...value, newAttribute]);
    }
    
    // 選択をリセット
    setSelectedAttributeId('');
    setNewValue('');
  };

  // 自由入力値を追加
  const handleAddFreeText = (attributeId: string) => {
    if (!newValue.trim()) return;
    
    // 既に選択済みかチェック
    const existingAttr = value.find(attr => attr.attributeId === attributeId);
    
    if (existingAttr) {
      // 既に値が存在する場合は追加
      if (!existingAttr.values.includes(newValue.trim())) {
        const updatedAttributes = value.map(attr => 
          attr.attributeId === attributeId
            ? { ...attr, values: [...attr.values, newValue.trim()] }
            : attr
        );
        onChange(updatedAttributes);
      }
    } else {
      // 新しい属性として追加
      const newAttribute: AttributeApplication = {
        attributeId,
        values: [newValue.trim()],
        note: '',
      };
      onChange([...value, newAttribute]);
    }
    
    // 入力をリセット
    setNewValue('');
  };

  // 値を削除
  const handleDeleteValue = (attributeId: string, valueToDelete: string) => {
    const updatedAttributes = value.map(attr => {
      if (attr.attributeId === attributeId) {
        const newValues = attr.values.filter(v => v !== valueToDelete);
        return {
          ...attr,
          values: newValues,
        };
      }
      return attr;
    })
    // 値が空になった属性を除外
    .filter(attr => attr.values.length > 0);
    
    onChange(updatedAttributes);
  };

  // ノートを更新
  const handleNoteChange = (attributeId: string, note: string) => {
    const updatedAttributes = value.map(attr => 
      attr.attributeId === attributeId
        ? { ...attr, note }
        : attr
    );
    onChange(updatedAttributes);
  };

  // 属性のセクションをレンダリング
  const renderAttributeSection = (attr: AttributeApplication) => {
    const schema = attributeDetails[attr.attributeId];
    if (!schema) return null;

    return (
      <Paper key={attr.attributeId} variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          {schema.name}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {attr.values.map((val, index) => (
            <Chip
              key={`${attr.attributeId}-${val}-${index}`}
              label={val}
              onDelete={() => handleDeleteValue(attr.attributeId, val)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
        
        {/* 自由入力が許可されている場合、追加の入力フィールドを表示 */}
        {schema.allowFreeText && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              size="small"
              placeholder="新しい値を追加"
              value={selectedAttributeId === attr.attributeId ? newValue : ''}
              onChange={(e) => {
                setSelectedAttributeId(attr.attributeId);
                setNewValue(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newValue.trim()) {
                  e.preventDefault();
                  handleAddFreeText(attr.attributeId);
                }
              }}
              sx={{ flexGrow: 1, mr: 1 }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleAddFreeText(attr.attributeId)}
              disabled={!newValue.trim() || selectedAttributeId !== attr.attributeId}
            >
              追加
            </Button>
          </Box>
        )}
        
        <TextField
          fullWidth
          size="small"
          label="メモ"
          value={attr.note || ''}
          onChange={(e) => handleNoteChange(attr.attributeId, e.target.value)}
          multiline
          rows={2}
        />
      </Paper>
    );
  };

  // 使用可能な属性（すでに選択されていないもの）
  const availableAttributes = attributeSchemas.filter(
    schema => !value.some(attr => attr.attributeId === schema.id)
  );

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        属性
      </Typography>
      
      {/* 選択済み属性のリスト */}
      {value.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {value.map(attr => renderAttributeSection(attr))}
        </Box>
      )}
      
      {/* 新しい属性を追加するセレクター */}
      {availableAttributes.length > 0 && (
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" error={!!error}>
              <InputLabel id="attribute-select-label">属性を追加</InputLabel>
              <Select
                labelId="attribute-select-label"
                value={selectedAttributeId}
                onChange={handleAttributeSelect}
                label="属性を追加"
              >
                <MenuItem value="">
                  <em>選択してください</em>
                </MenuItem>
                {availableAttributes.map(schema => (
                  <MenuItem key={schema.id} value={schema.id}>
                    {schema.name}
                  </MenuItem>
                ))}
              </Select>
              {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          </Grid>
          
          {selectedAttributeId && attributeDetails[selectedAttributeId] && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" gutterBottom>
                  {attributeDetails[selectedAttributeId].description || '説明なし'}
                </Typography>
                
                {/* 定義済み値がある場合はそれを表示 */}
                {attributeDetails[selectedAttributeId].predefinedValues && 
                 attributeDetails[selectedAttributeId].predefinedValues!.length > 0 && (
                  <Box>
                    <Typography variant="body2" gutterBottom fontWeight="bold" sx={{ mt: 1 }}>
                      選択肢:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {attributeDetails[selectedAttributeId].predefinedValues!.map(option => (
                        <Chip
                          key={option.id}
                          label={option.value}
                          onClick={() => handlePredefinedValueSelect(selectedAttributeId, option.value)}
                          clickable
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* 自由入力が許可されている場合 */}
                {attributeDetails[selectedAttributeId].allowFreeText && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="カスタム値"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newValue.trim()) {
                          e.preventDefault();
                          handleAddFreeText(selectedAttributeId);
                        }
                      }}
                      sx={{ mr: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => handleAddFreeText(selectedAttributeId)}
                      disabled={!newValue.trim()}
                    >
                      追加
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      
      {availableAttributes.length === 0 && value.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          利用可能な属性がありません。属性管理から新しい属性を作成してください。
        </Typography>
      )}
    </Box>
  );
};

export default AttributeSelector;