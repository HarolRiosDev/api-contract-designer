export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ParameterLocation = 'path' | 'query' | 'header';

export type OpenApiType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

export type OpenApiFormat = 'int32' | 'int64' | 'float' | 'double' | 'date' | 'date-time' | 'email' | 'password' | '';

export interface Parameter {
  name: string;
  in: ParameterLocation;
  description?: string;
  required: boolean;
  schema: Schema;
}

export interface Schema {
  type: OpenApiType;
  format?: OpenApiFormat;
  description?: string;
  required?: string[];
  properties?: Record<string, Schema>;
  items?: Schema;
}

export interface Operation {
  summary: string;
  description?: string;
  operationId: string;
  parameters?: Parameter[];
  requestBody?: {
    content: {
      'application/json': {
        schema: Schema;
      };
    };
  };
  responses: Record<string, {
    description: string;
    content?: {
      'application/json': {
        schema: Schema;
      };
    };
  }>;
}

export interface Path {
  [method: string]: Operation;
}

export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, Path>;
  components: {
    schemas: Record<string, Schema>;
  };
} 