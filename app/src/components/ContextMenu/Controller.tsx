import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import ContextMenu from './View';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
}

interface ContextMenuContextProps {
  registerMenuItems: (id: string, items: ContextMenuItem[]) => void;
  unregisterMenuItems: (id: string) => void;
}

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
  const menuItemsMap = React.useRef(new Map<string, ContextMenuItem[]>());

  const registerMenuItems = useCallback((id: string, items: ContextMenuItem[]) => {
    menuItemsMap.current.set(id, items);
  }, []);

  const unregisterMenuItems = useCallback((id: string) => {
    menuItemsMap.current.delete(id);
  }, []);

  const handleContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault();
    let target = event.target as HTMLElement;
    let contextMenuId: string | null = null;

    // Traverse up the DOM tree to find an element with a data-contextmenu-id
    while (target && !contextMenuId) {
      contextMenuId = target.getAttribute('data-contextmenu-id');
      target = target.parentElement as HTMLElement;
    }

    if (contextMenuId) {
      const items = menuItemsMap.current.get(contextMenuId) || [];
      setMenuState({
        x: event.clientX,
        y: event.clientY,
        items,
        isOpen: true,
      });
    } else {
      setMenuState(prev => ({ ...prev, isOpen: false }));
    }
  }, []);

  const handleClick = useCallback(() => {
    setMenuState(prev => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, [handleContextMenu, handleClick]);

  return (
    <ContextMenuContext.Provider value={{ registerMenuItems, unregisterMenuItems }}>
      {children}
      {menuState.isOpen && (
        <ContextMenu
          x={menuState.x}
          y={menuState.y}
          items={menuState.items}
          onClose={() => setMenuState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </ContextMenuContext.Provider>
  );
};