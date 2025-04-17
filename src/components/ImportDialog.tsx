import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Tab,
  Tabs,
} from '@mui/material';
import { useApiContext } from '../context/ApiContext';
import { load as yamlLoad } from 'js-yaml';
import { OpenApiSpec } from '../types/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`import-tabpanel-${index}`}
      aria-labelledby={`import-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

const validateOpenApiSpec = (spec: unknown): spec is OpenApiSpec => {
  if (typeof spec !== 'object' || spec === null) return false;
  
  const typedSpec = spec as Partial<OpenApiSpec>;
  
  if (typeof typedSpec.openapi !== 'string') return false;
  if (typeof typedSpec.info?.title !== 'string') return false;
  if (typeof typedSpec.info?.version !== 'string') return false;
  if (!Array.isArray(typedSpec.servers)) return false;
  if (typeof typedSpec.paths !== 'object') return false;
  if (typeof typedSpec.components?.schemas !== 'object' && typedSpec.components?.schemas !== undefined) return false;

  return true;
};

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose }) => {
  const { setApiSpec } = useApiContext();
  const [activeTab, setActiveTab] = useState(0);
  const [yamlContent, setYamlContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const processImport = useCallback((content: string) => {
    try {
      const parsedContent = yamlLoad(content);
      
      if (!validateOpenApiSpec(parsedContent)) {
        setError('El contenido no es una especificación OpenAPI válida. Verifica la estructura del documento.');
        return;
      }

      setApiSpec(parsedContent);
      onClose();
    } catch (err) {
      setError('Error al procesar el contenido. Asegúrate de que sea un YAML o JSON válido.');
    }
  }, [setApiSpec, onClose]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        processImport(content);
      }
    };
    reader.readAsText(file);
  }, [processImport]);

  const handlePasteImport = useCallback(() => {
    processImport(yamlContent);
  }, [yamlContent, processImport]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Importar Especificación OpenAPI</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Subir Archivo" />
            <Tab label="Pegar Contenido" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <input
              accept=".yaml,.yml,.json"
              style={{ display: 'none' }}
              id="import-file"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="import-file">
              <Button variant="contained" component="span">
                Seleccionar Archivo
              </Button>
            </label>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Formatos soportados: YAML (.yaml, .yml) y JSON (.json)
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder="Pega aquí tu especificación OpenAPI en formato YAML o JSON..."
            value={yamlContent}
            onChange={(e) => setYamlContent(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handlePasteImport}
            disabled={!yamlContent}
            sx={{ mt: 2 }}
          >
            Importar Contenido
          </Button>
        </TabPanel>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog; 