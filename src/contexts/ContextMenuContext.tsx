import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import ContextMenu from 'components/menus/ContextMenu/View';
import './ContextMenuContext.css';

interface ContextMenuContextProps {
  registerMenuItems: (id: string, items: ContextMenuItem[]) => void;
  unregisterMenuItems: (id: string) => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

export interface BaseContextMenuItem {
  label: string;
  type: string;
}

export interface ActionContextMenuItem extends BaseContextMenuItem {
  type: 'action';
  onClick: () => void;
}

export interface ModalContextMenuItem extends BaseContextMenuItem {
  type: 'modal';
  modalContent: () => React.ReactNode;
}

export interface SubmenuContextMenuItem extends BaseContextMenuItem {
  type: 'submenu';
  items: ContextMenuItem[];
}

export interface CustomContextMenuItem extends BaseContextMenuItem {
  type: 'custom';
  render: () => React.ReactNode;
}

export type ContextMenuItem =
  | ActionContextMenuItem
  | ModalContextMenuItem
  | SubmenuContextMenuItem
  | CustomContextMenuItem;

const ContextMenuContext = createContext<ContextMenuContextProps | undefined>(undefined);

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};

interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
  isOpen: boolean;
}

export const ContextMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuState, setMenuState] = useState<ContextMenuState>({
    x: 0,
    y: 0,
    items: [],
    isOpen: false,
  });
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);

  const menuItemsMap = React.useRef(new Map<string, ContextMenuItem[]>());
  const longPressTimer = React.useRef<number | null>(null);
  const longPressThreshold = 500; // milliseconds

  const registerMenuItems = useCallback((id: string, items: ContextMenuItem[]) => {
    menuItemsMap.current.set(id, items);
  }, []);

  const unregisterMenuItems = useCallback((id: string) => {
    menuItemsMap.current.delete(id);
  }, []);

  const openModal = useCallback((content: React.ReactNode) => {
    setModalContent(content);
  }, []);

  const closeModal = useCallback(() => {
    setModalContent(null);
  }, []);

  const handleContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault();
    showContextMenu(event.clientX, event.clientY, event.target as HTMLElement);
  }, []);

  const showContextMenu = useCallback((x: number, y: number, target: HTMLElement) => {
    let contextMenuId: string | null = null;

    // Traverse up the DOM tree to find an element with a data-contextmenu-id
    while (target && !contextMenuId) {
      contextMenuId = target.getAttribute('data-contextmenu-id');
      target = target.parentElement as HTMLElement;
    }

    if (contextMenuId) {
      const items = menuItemsMap.current.get(contextMenuId) || [];
      setMenuState({
        x,
        y,
        items,
        isOpen: true,
      });
    } else {
      setMenuState(prev => ({ ...prev, isOpen: false }));
    }
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      longPressTimer.current = window.setTimeout(() => {
        showContextMenu(touch.clientX, touch.clientY, event.target as HTMLElement);
      }, longPressThreshold);
    }
  }, [showContextMenu]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    setMenuState(prev => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('click', handleClick);
    };
  }, [handleContextMenu, handleTouchStart, handleTouchEnd, handleTouchMove, handleClick]);

  return (
    <ContextMenuContext.Provider value={{ registerMenuItems, unregisterMenuItems, openModal, closeModal }}>
      {children}
      {menuState.isOpen && (
        <ContextMenu
          x={menuState.x}
          y={menuState.y}
          items={menuState.items}
          onClose={() => setMenuState(prev => ({ ...prev, isOpen: false }))}
          onModalOpen={openModal}
        />
      )}
      {modalContent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalContent}
          </div>
        </div>
      )}
    </ContextMenuContext.Provider>
  );
};