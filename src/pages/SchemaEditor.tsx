import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useApiContext } from '../context/ApiContext';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { OpenApiType, OpenApiFormat, Schema } from '../types/api';

const SchemaEditor: React.FC = () => {
  const { apiSpec, addSchema } = useApiContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchema, setEditingSchema] = useState<string | null>(null);
  const [schemaName, setSchemaName] = useState('');
  const [properties, setProperties] = useState<Record<string, Schema>>({});
  const [newProperty, setNewProperty] = useState({
    name: '',
    type: 'string' as OpenApiType,
    format: '' as OpenApiFormat,
    description: '',
    required: false,
  });

  const handleOpenDialog = (schemaName?: string) => {
    if (schemaName) {
      setEditingSchema(schemaName);
      setSchemaName(schemaName);
      const schema = apiSpec.components.schemas[schemaName];
      if (schema && schema.properties) {
        setProperties(schema.properties);
      }
    } else {
      setEditingSchema(null);
      setSchemaName('');
      setProperties({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchema(null);
    setSchemaName('');
    setProperties({});
    setNewProperty({
      name: '',
      type: 'string',
      format: '',
      description: '',
      required: false,
    });
  };

  const handleAddProperty = () => {
    if (newProperty.name && newProperty.type) {
      const updatedProperties: Record<string, Schema> = {
        ...properties,
        [newProperty.name]: {
          type: newProperty.type,
          description: newProperty.description || '',
          format: newProperty.format || undefined,
          required: newProperty.required ? [newProperty.name] : []
        }
      };
      setProperties(updatedProperties);
      setNewProperty({
        name: '',
        type: 'string',
        format: '',
        description: '',
        required: false,
      });
    }
  };

  const handleSaveSchema = () => {
    if (schemaName) {
      const schema: Schema = {
        type: 'object',
        properties,
        required: Object.entries(properties)
          .filter(([, prop]) => prop.required)
          .map(([name]) => name)
      };
      addSchema(schemaName, schema);
      handleCloseDialog();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Esquemas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Esquema
        </Button>
      </Box>

      <Grid container spacing={3}>
        {Object.entries(apiSpec.components.schemas).map(([name, schema]) => (
          <Grid item xs={12} md={6} lg={4} key={name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{name}</Typography>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(name)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <List>
                  {schema.properties && Object.entries(schema.properties).map(([propName, prop]) => (
                    <ListItem key={propName}>
                      <ListItemText
                        primary={propName}
                        secondary={`${prop.type}${prop.format ? ` (${prop.format})` : ''}${prop.description ? ` - ${prop.description}` : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSchema ? 'Editar Esquema' : 'Nuevo Esquema'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Esquema"
            fullWidth
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="h6" gutterBottom>
            Propiedades
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Nombre"
                fullWidth
                value={newProperty.name}
                onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={newProperty.type}
                  label="Tipo"
                  onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value as OpenApiType })}
                >
                  <MenuItem value="string">String</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="integer">Integer</MenuItem>
                  <MenuItem value="boolean">Boolean</MenuItem>
                  <MenuItem value="array">Array</MenuItem>
                  <MenuItem value="object">Object</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Formato</InputLabel>
                <Select
                  value={newProperty.format}
                  label="Formato"
                  onChange={(e) => setNewProperty({ ...newProperty, format: e.target.value as OpenApiFormat })}
                >
                  <MenuItem value="">Ninguno</MenuItem>
                  <MenuItem value="int32">int32</MenuItem>
                  <MenuItem value="int64">int64</MenuItem>
                  <MenuItem value="float">float</MenuItem>
                  <MenuItem value="double">double</MenuItem>
                  <MenuItem value="date">date</MenuItem>
                  <MenuItem value="date-time">date-time</MenuItem>
                  <MenuItem value="email">email</MenuItem>
                  <MenuItem value="password">password</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newProperty.required}
                    onChange={(e) => setNewProperty({ ...newProperty, required: e.target.checked })}
                  />
                }
                label="Requerido"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                value={newProperty.description}
                onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddProperty}
                disabled={!newProperty.name}
              >
                Agregar Propiedad
              </Button>
            </Grid>
          </Grid>

          <List>
            {Object.entries(properties).map(([name, prop]) => (
              <ListItem key={name}>
                <ListItemText
                  primary={name}
                  secondary={`${prop.type}${prop.format ? ` (${prop.format})` : ''}${prop.description ? ` - ${prop.description}` : ''}`}
                />
                <IconButton
                  onClick={() => {
                    const newProperties = { ...properties };
                    delete newProperties[name];
                    setProperties(newProperties);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveSchema} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchemaEditor; 