import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { useApiContext } from '../context/ApiContext';
import { HttpMethod, Parameter, Schema, ParameterLocation, OpenApiType, OpenApiFormat } from '../types/api';
import PathCanvas from '../components/PathCanvas';
import DeleteIcon from '@mui/icons-material/Delete';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`path-tabpanel-${index}`}
      aria-labelledby={`path-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const PathEditor: React.FC = () => {
  const { apiSpec, addPath, removePath, addOperation } = useApiContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [path, setPath] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [newParameter, setNewParameter] = useState({
    name: '',
    in: 'query' as ParameterLocation,
    description: '',
    required: false,
    schema: {
      type: 'string' as OpenApiType,
      format: '' as OpenApiFormat,
    },
  });
  const [operation, setOperation] = useState({
    method: 'GET' as HttpMethod,
    summary: '',
    description: '',
    parameters: [] as Parameter[],
    requestBody: {
      content: {
        'application/json': {
          schema: {} as Schema,
        },
      },
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: {} as Schema,
          },
        },
      },
    } as Record<string, {
      description: string;
      content?: {
        'application/json': {
          schema: Schema;
        };
      };
    }>,
  });

  const handleOpenDialog = (pathName?: string): void => {
    if (pathName) {
      setEditingPath(pathName);
      setPath(pathName);
      // Cargar la operación existente si existe
      const existingOperation = apiSpec.paths[pathName]?.[operation.method.toLowerCase()];
      if (existingOperation) {
        setOperation({
          ...operation,
          summary: existingOperation.summary,
          description: existingOperation.description || '',
          parameters: existingOperation.parameters || [],
          requestBody: existingOperation.requestBody || operation.requestBody,
          responses: existingOperation.responses,
        });
      }
    } else {
      setEditingPath(null);
      setPath('');
      setOperation({
        method: 'GET',
        summary: '',
        description: '',
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {} as Schema,
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {} as Schema,
              },
            },
          },
        },
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setEditingPath(null);
    setPath('');
    setTabValue(0);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
  };

  const handleSavePath = (): void => {
    if (path) {
      addPath(path, operation.method, {
        summary: operation.summary,
        description: operation.description,
        operationId: `${operation.method.toLowerCase()}-${path.replace(/\//g, '-')}`,
        parameters: operation.parameters,
        requestBody: operation.requestBody,
        responses: operation.responses,
      });
    }
  };

  const handleAddParameter = (): void => {
    if (newParameter.name) {
      setOperation(prev => ({
        ...prev,
        parameters: [...prev.parameters, { ...newParameter }],
      }));
      setNewParameter({
        name: '',
        in: 'query',
        description: '',
        required: false,
        schema: {
          type: 'string',
          format: '',
        },
      });
    }
  };

  const handleRemoveParameter = (index: number): void => {
    setOperation(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index),
    }));
  };

  const handleAddOperation = (path: string, method: HttpMethod): void => {
    if (!path) {
      setOpenDialog(true);
      setOperation(prev => ({ ...prev, method }));
    } else {
      addOperation(path, method, {
        summary: '',
        description: '',
        operationId: `${method.toLowerCase()}-${path.replace(/\//g, '-')}`,
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {} as Schema,
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {} as Schema,
              },
            },
          },
        },
      });
    }
  };

  const handleDeletePath = (path: string): void => {
    removePath(path);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Endpoints</Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <PathCanvas
          paths={apiSpec.paths}
          onEdit={handleOpenDialog}
          onDelete={handleDeletePath}
          onAddOperation={handleAddOperation}
          onAddEndpoint={() => handleOpenDialog()}
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPath ? 'Editar Endpoint' : 'Nuevo Endpoint'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
            <Box sx={{ gridColumn: 'span 12' }}>
              <TextField
                fullWidth
                label="Nombre del Path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>
              <FormControl fullWidth>
                <InputLabel>Método HTTP</InputLabel>
                <Select
                  value={operation.method}
                  label="Método HTTP"
                  onChange={(e) => setOperation({ ...operation, method: e.target.value as HttpMethod })}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="General" />
            <Tab label="Parámetros" />
            <Tab label="Cuerpo" />
            <Tab label="Respuestas" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <TextField
              label="Resumen"
              fullWidth
              value={operation.summary}
              onChange={(e) => setOperation({ ...operation, summary: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={4}
              value={operation.description}
              onChange={(e) => setOperation({ ...operation, description: e.target.value })}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={newParameter.name}
                  onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
                <FormControl fullWidth>
                  <InputLabel>Ubicación</InputLabel>
                  <Select
                    value={newParameter.in}
                    label="Ubicación"
                    onChange={(e) => setNewParameter({ ...newParameter, in: e.target.value as ParameterLocation })}
                  >
                    <MenuItem value="query">Query</MenuItem>
                    <MenuItem value="path">Path</MenuItem>
                    <MenuItem value="header">Header</MenuItem>
                    <MenuItem value="cookie">Cookie</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={newParameter.schema.type}
                    label="Tipo"
                    onChange={(e) => setNewParameter({
                      ...newParameter,
                      schema: { ...newParameter.schema, type: e.target.value as OpenApiType }
                    })}
                  >
                    <MenuItem value="string">String</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="integer">Integer</MenuItem>
                    <MenuItem value="boolean">Boolean</MenuItem>
                    <MenuItem value="array">Array</MenuItem>
                    <MenuItem value="object">Object</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newParameter.required}
                      onChange={(e) => setNewParameter({ ...newParameter, required: e.target.checked })}
                    />
                  }
                  label="Requerido"
                />
              </Box>
              <Box sx={{ gridColumn: 'span 12' }}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={newParameter.description}
                  onChange={(e) => setNewParameter({ ...newParameter, description: e.target.value })}
                />
              </Box>
              <Box sx={{ gridColumn: 'span 12' }}>
                <Button
                  variant="contained"
                  onClick={handleAddParameter}
                  disabled={!newParameter.name}
                >
                  Agregar Parámetro
                </Button>
              </Box>
            </Box>

            <List>
              {operation.parameters.map((param, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={param.name}
                    secondary={`${param.in} - ${param.schema?.type || 'string'}${param.schema?.format ? ` (${param.schema.format})` : ''}${param.required ? ' - Requerido' : ''}${param.description ? ` - ${param.description}` : ''}`}
                  />
                  <IconButton onClick={() => handleRemoveParameter(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography>Editor de cuerpo de solicitud (pendiente)</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography>Editor de respuestas (pendiente)</Typography>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSavePath} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PathEditor; 