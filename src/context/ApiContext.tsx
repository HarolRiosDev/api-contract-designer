import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OpenApiSpec, Schema, HttpMethod, Operation } from '../types/api';

interface ApiContextType {
  apiSpec: OpenApiSpec;
  setApiSpec: (spec: OpenApiSpec) => void;
  selectedPath: string;
  setSelectedPath: (path: string) => void;
  selectedMethod: string;
  setSelectedMethod: (method: string) => void;
  addPath: (path: string, method: HttpMethod, operation: Operation) => void;
  addSchema: (name: string, schema: Schema) => void;
  removePath: (path: string) => void;
  addOperation: (path: string, method: HttpMethod, operation: Operation) => void;
}

const initialApiSpec: OpenApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Contract Designer',
    version: '1.0.0',
    description: 'API designed with API Contract Designer'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  paths: {},
  components: {
    schemas: {}
  }
};

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
};

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [apiSpec, setApiSpec] = useState<OpenApiSpec>(initialApiSpec);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const addPath = (path: string, method: HttpMethod, operation: Operation) => {
    setApiSpec(prev => ({
      ...prev,
      paths: {
        ...prev.paths,
        [path]: {
          ...prev.paths[path],
          [method.toLowerCase()]: operation
        }
      }
    }));
  };

  const removePath = (path: string) => {
    setApiSpec(prev => {
      const newPaths = { ...prev.paths };
      delete newPaths[path];
      return {
        ...prev,
        paths: newPaths,
      };
    });
  };

  const addOperation = (path: string, method: HttpMethod, operation: Operation) => {
    setApiSpec(prev => ({
      ...prev,
      paths: {
        ...prev.paths,
        [path]: {
          ...prev.paths[path],
          [method.toLowerCase()]: operation
        }
      }
    }));
  };

  const addSchema = (name: string, schema: Schema) => {
    setApiSpec(prev => ({
      ...prev,
      components: {
        ...prev.components,
        schemas: {
          ...prev.components.schemas,
          [name]: schema
        }
      }
    }));
  };

  return (
    <ApiContext.Provider
      value={{
        apiSpec,
        setApiSpec,
        selectedPath,
        setSelectedPath,
        selectedMethod,
        setSelectedMethod,
        addPath,
        addSchema,
        removePath,
        addOperation
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}; 