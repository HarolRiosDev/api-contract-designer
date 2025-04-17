import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ApiProvider } from './context/ApiContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SchemaEditor from './pages/SchemaEditor';
import PathEditor from './pages/PathEditor';
import OpenApiViewer from './pages/OpenApiViewer';

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
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApiProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/schemas" element={<SchemaEditor />} />
              <Route path="/paths" element={<PathEditor />} />
              <Route path="/openapi" element={<OpenApiViewer />} />
            </Routes>
          </Layout>
        </Router>
      </ApiProvider>
    </ThemeProvider>
  );
}

export default App;
