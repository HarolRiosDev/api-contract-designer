import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApiContext } from '../context/ApiContext';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadIcon from '@mui/icons-material/Upload';
import ImportDialog from '../components/ImportDialog';
import { OpenApiSpec } from '../types/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { apiSpec } = useApiContext();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const stats = {
    paths: Object.keys(apiSpec.paths || {}).length,
    schemas: Object.keys(apiSpec.components?.schemas || {}).length,
    operations: Object.values(apiSpec.paths || {}).reduce((acc, path) => acc + Object.keys(path).length, 0),
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">API Contract Designer</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setImportDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Importar OpenAPI
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/paths/new')}
          >
            Nuevo Path
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Endpoints
              </Typography>
              <Typography variant="h3">{stats.paths}</Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<AddIcon />}
                onClick={() => navigate('/paths')}
              >
                Agregar Endpoint
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Esquemas
              </Typography>
              <Typography variant="h3">{stats.schemas}</Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<AddIcon />}
                onClick={() => navigate('/schemas')}
              >
                Agregar Esquema
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Operaciones
              </Typography>
              <Typography variant="h3">{stats.operations}</Typography>
            </CardContent>
            <CardActions>
              <Button
                startIcon={<EditIcon />}
                onClick={() => navigate('/paths')}
              >
                Gestionar Operaciones
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Acciones Rápidas
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/paths')}
              >
                Nuevo Endpoint
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/schemas')}
              >
                Nuevo Esquema
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<VisibilityIcon />}
                onClick={() => navigate('/openapi')}
              >
                Ver OpenAPI
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
      />
    </Box>
  );
};

export default Dashboard; 