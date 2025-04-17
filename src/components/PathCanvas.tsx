import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragStartEvent,
  UniqueIdentifier,
  DraggableAttributes
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box, Paper, Typography, IconButton, Tooltip, TextField, alpha } from '@mui/material';
import { HttpMethod, Operation } from '../types/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import InfoIcon from '@mui/icons-material/Info';
import type { Transform } from '@dnd-kit/utilities';

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

interface EndpointNodeProps {
  path: string;
  operations: Record<string, Operation>;
  onEdit: (path: string) => void;
  onDelete: (path: string) => void;
  attributes?: DraggableAttributes;
  listeners?: Record<string, Function>;
}

const EndpointNode: React.FC<EndpointNodeProps> = ({ path, operations, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: path,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        '&:hover': { 
          boxShadow: 2,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        },
        mb: 2,
      }}
    >
      <DropZone path={path} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing'
            }
          }}
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main'
              }
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>{path}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(operations).map(([method, operation]) => (
              <Tooltip 
                key={method}
                title={`${method.toUpperCase()}: ${operation.summary || 'Sin descripción'}`}
              >
                <Box
                  role="button"
                  aria-label={`Operación ${method.toUpperCase()}`}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 0.75,
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                >
                  {method.toUpperCase()}
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Editar endpoint">
            <IconButton 
              onClick={() => onEdit(path)} 
              size="small"
              aria-label="Editar endpoint"
              sx={{
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'primary.main'
                }
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar endpoint">
            <IconButton 
              onClick={() => onDelete(path)} 
              size="small"
              aria-label="Eliminar endpoint"
              sx={{
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'error.main'
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

const OperationItem: React.FC<{ operation: string }> = ({ operation }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: operation,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  } : undefined;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      aria-label={operation}
      sx={{
        p: 2,
        cursor: 'grab',
        '&:hover': { 
          bgcolor: 'action.hover',
          transform: 'translateX(4px)',
          transition: 'all 0.2s ease-in-out'
        },
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        mb: 1,
        borderRadius: 1,
        ...(isDragging && {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          boxShadow: 3,
          transform: 'scale(1.02)',
        }),
      }}
      {...attributes}
      {...listeners}
    >
      <DragIndicatorIcon sx={{ 
        color: 'text.secondary',
        '&:hover': {
          color: 'primary.main'
        }
      }} />
      <Typography variant="body1" sx={{ fontWeight: 500 }}>{operation}</Typography>
      <Tooltip title={`Arrastra para añadir una operación ${operation} a un endpoint`}>
        <InfoIcon sx={{ 
          ml: 'auto', 
          fontSize: '1.2rem', 
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main'
          }
        }} />
      </Tooltip>
    </Box>
  );
};

const DropZone: React.FC<{ path: string }> = ({ path }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: path,
  });

  return (
    <Box
      ref={setNodeRef}
      role="drop-zone"
      aria-label={`Zona de soltado para ${path}`}
      sx={{
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        bgcolor: isOver ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
        border: isOver ? (theme) => `2px dashed ${alpha(theme.palette.primary.main, 0.5)}` : 'none',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
};

interface OperationPaletteProps {
  onDragStart: (method: HttpMethod) => void;
}

const OperationPalette: React.FC<OperationPaletteProps> = ({ onDragStart }) => {
  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const methodColors = {
    GET: '#61affe',
    POST: '#49cc90',
    PUT: '#fca130',
    DELETE: '#f93e3e',
    PATCH: '#50e3c2',
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Operaciones</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {methods.map((method) => (
          <Box
            key={method}
            draggable
            onDragStart={() => onDragStart(method)}
            sx={{
              bgcolor: methodColors[method],
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 1,
              cursor: 'move',
              fontWeight: 500,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
            }}
          >
            {method}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

interface PathCanvasProps {
  paths: Record<string, Record<string, Operation>>;
  onAddOperation: (path: string, method: HttpMethod) => void;
  onEdit: (path: string) => void;
  onDelete: (path: string) => void;
  onAddEndpoint: () => void;
}

const PathCanvas: React.FC<PathCanvasProps> = ({ paths, onAddOperation, onEdit, onDelete, onAddEndpoint }) => {
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  
  const operations = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const filteredOperations = operations.filter(op => 
    op.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onAddOperation(over.id as string, active.id as HttpMethod);
    }
    setActiveId(null);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        height: '100%', 
        gap: 3,
        p: 3,
        maxWidth: '1400px',
        mx: 'auto'
      }}
      component="section"
    >
      <Box 
        sx={{ 
          width: isPaletteCollapsed ? '50px' : '280px',
          transition: 'width 0.3s ease',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          {!isPaletteCollapsed && (
            <TextField
              size="small"
              placeholder="Buscar operación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
            />
          )}
          <Tooltip title={isPaletteCollapsed ? "Expandir paleta" : "Colapsar paleta"}>
            <IconButton 
              onClick={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
              size="small"
            >
              {isPaletteCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        
        {!isPaletteCollapsed && (
          <Box sx={{ overflow: 'auto', flex: 1, p: 2 }}>
            {filteredOperations.map((operation) => (
              <OperationItem key={operation} operation={operation} />
            ))}
          </Box>
        )}
      </Box>
      
      <Box
        sx={{
          flex: 1,
          p: 3,
          borderRadius: 2,
          minHeight: 400,
          overflow: 'auto',
          position: 'relative',
          bgcolor: 'background.paper',
          boxShadow: 1
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={Object.keys(paths)}
            strategy={verticalListSortingStrategy}
          >
            {Object.entries(paths).map(([path, operations]) => (
              <EndpointNode
                key={path}
                path={path}
                operations={operations}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  p: 2,
                  borderRadius: 1,
                  boxShadow: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <DragIndicatorIcon sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">{activeId}</Typography>
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>
    </Box>
  );
};

export default PathCanvas; 