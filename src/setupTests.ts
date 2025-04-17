import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configurar el tiempo de espera para los tooltips
configure({ asyncUtilTimeout: 1000 }); 