import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import PathCanvas from '../PathCanvas';
import { ApiProvider } from '../../context/ApiContext';
import '@testing-library/jest-dom';

// Mock de las funciones necesarias
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockOnAddOperation = jest.fn();
const mockOnAddEndpoint = jest.fn();

// Datos de prueba
const mockPaths = {
  '/users': {
    get: {
      summary: 'Obtener usuarios',
      description: 'Retorna la lista de usuarios',
    },
  },
  '/products': {
    post: {
      summary: 'Crear producto',
      description: 'Crea un nuevo producto',
    },
  },
};

// Componente wrapper para proporcionar el contexto
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ApiProvider>
    <DndContext>
      {children}
    </DndContext>
  </ApiProvider>
);

describe('PathCanvas - Pruebas de Interacción', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<PathCanvas />);
  });

  it('debería mostrar el DragOverlay al arrastrar una operación', async () => {
    // Encontrar el elemento arrastrable (GET)
    const getOperation = screen.getByRole('button', { name: /get/i });
    
    // Simular el inicio del arrastre
    fireEvent.mouseDown(getOperation);
    
    // Verificar que el DragOverlay aparece
    const dragOverlay = screen.getByRole('drag-overlay');
    expect(dragOverlay).toBeVisible();
    expect(dragOverlay).toHaveStyle({
      opacity: '0.5',
      boxShadow: expect.any(String),
    });
  });

  test('debería mostrar el DropZone al arrastrar sobre un endpoint', async () => {
    // Encontrar el elemento arrastrable (GET) usando un selector más específico
    const getOperation = screen.getByTestId('operation-GET');
    const endpointNode = screen.getByTestId('endpoint-/users');

    // Simular el inicio del arrastre
    fireEvent.mouseDown(getOperation);
    fireEvent.dragStart(getOperation);

    // Simular el arrastre sobre el endpoint
    fireEvent.dragEnter(endpointNode);
    fireEvent.dragOver(endpointNode);

    // Verificar que el DropZone se muestra
    const dropZone = screen.getByTestId('drop-zone');
    expect(dropZone).toBeVisible();

    // Simular soltar el elemento
    fireEvent.drop(endpointNode);
    fireEvent.dragEnd(getOperation);
  });

  test('debería mostrar tooltips al hacer hover sobre elementos interactivos', async () => {
    // Probar tooltip del botón de editar usando un selector más específico
    const editButton = screen.getByTestId('edit-button-/users');
    fireEvent.mouseOver(editButton);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', { name: /editar endpoint/i });
      expect(tooltip).toBeVisible();
    });

    fireEvent.mouseOut(editButton);
  });

  test('debería mostrar tooltips informativos para las operaciones HTTP', async () => {
    // Probar tooltip de una operación GET usando un selector más específico
    const getOperation = screen.getByTestId('operation-GET');
    fireEvent.mouseOver(getOperation);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', { name: /arrastra para añadir una operación get/i });
      expect(tooltip).toBeVisible();
    });

    fireEvent.mouseOut(getOperation);
  });

  test('debería mantener el contraste adecuado en los elementos visuales', () => {
    // Verificar contraste en los botones de acción usando selectores más específicos
    const editButton = screen.getByTestId('edit-button-/users');
    const deleteButton = screen.getByTestId('delete-button-/users');

    // Verificar que los botones tienen un contraste adecuado
    expect(editButton).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.04)' });
    expect(deleteButton).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.04)' });

    // Verificar contraste en las operaciones
    const getOperation = screen.getByTestId('operation-GET');
    expect(getOperation).toHaveStyle({ backgroundColor: '#f5f5f5' });
  });

  test('debería permitir colapsar y expandir la paleta de operaciones', () => {
    const collapseButton = screen.getByTestId('collapse-palette-button');
    
    // Verificar estado inicial
    const palette = screen.getByTestId('operations-palette');
    expect(palette).toHaveStyle({ width: '250px' });

    // Colapsar paleta
    fireEvent.click(collapseButton);
    expect(palette).toHaveStyle({ width: '50px' });

    // Expandir paleta
    fireEvent.click(collapseButton);
    expect(palette).toHaveStyle({ width: '250px' });
  });
}); 