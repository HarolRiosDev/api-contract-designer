# API Contract Designer

Una herramienta visual para diseñar y generar especificaciones OpenAPI 3.0.

## Características

- Diseño visual de endpoints y operaciones HTTP
- Editor de esquemas de datos
- Generación de especificaciones OpenAPI 3.0 en formato JSON y YAML
- Interfaz de usuario intuitiva y moderna
- Exportación de especificaciones para uso con herramientas de generación de código

## Requisitos

- Node.js 16 o superior
- npm 7 o superior

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/HarolRiosDev/api-contract-designer.git
cd api-contract-designer
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Uso

1. **Dashboard**: Vista general de la API con estadísticas y acciones rápidas.
2. **Esquemas**: Editor para definir modelos de datos reutilizables.
3. **Endpoints**: Editor para definir rutas y operaciones HTTP.
4. **OpenAPI**: Visualización y exportación de la especificación OpenAPI.

## Tecnologías Utilizadas

- React con TypeScript
- Material-UI para la interfaz de usuario
- Monaco Editor para la visualización de código
- js-yaml para la manipulación de YAML
- Vite como bundler
