import React, { useState } from 'react';
import { Box, Typography, Button, Tabs, Tab, Paper } from '@mui/material';
import Editor from '@monaco-editor/react';
import { useApiContext } from '../context/ApiContext';
import DownloadIcon from '@mui/icons-material/Download';
import { dump } from 'js-yaml';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`openapi-tabpanel-${index}`}
      aria-labelledby={`openapi-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const OpenApiViewer: React.FC = () => {
  const { apiSpec } = useApiContext();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDownload = (format: 'json' | 'yaml') => {
    const content = format === 'json'
      ? JSON.stringify(apiSpec, null, 2)
      : dump(apiSpec);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openapi-spec.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Especificación OpenAPI</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownload('json')}
            sx={{ mr: 2 }}
          >
            Descargar JSON
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownload('yaml')}
          >
            Descargar YAML
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="JSON" />
          <Tab label="YAML" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Editor
            height="600px"
            defaultLanguage="json"
            value={JSON.stringify(apiSpec, null, 2)}
            options={{
              readOnly: true,
              minimap: { enabled: false },
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Editor
            height="600px"
            defaultLanguage="yaml"
            value={dump(apiSpec)}
            options={{
              readOnly: true,
              minimap: { enabled: false },
            }}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default OpenApiViewer; 