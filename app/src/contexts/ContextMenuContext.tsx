import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ContextMenu, { ContextMenuItem } from '../components/ContextMenu/ContextMenu';

interface ContextMenuContextProps {
  registerMenuItems: (items: ContextMenuItem[]) => void;
}

const ContextMenuContext = createContext<ContextMenuContextProps | undefined>(undefined);

export const useContextMenuRegistration = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenuRegistration must be used within a ContextMenuProvider');
  }
  return context;
};

interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

export const ContextMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuState, setMenuState] = useState<ContextMenuState | null>(null);
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([]);

  const registerMenuItems = useCallback((items: ContextMenuItem[]) => {
    setMenuItems(prevItems => [...prevItems, ...items]);
  }, []);

  const handleContextMenu = useCallback((event: MouseEvent) => {
    event.preventDefault();
    setMenuState({ x: event.clientX, y: event.clientY, items: [] });
    setMenuItems([]); // Clear existing menu items
    // Dispatch a custom event to notify nested components
    const contextMenuEvent = new CustomEvent('contextmenu-aggregate', {
      detail: {
        registerMenuItems,
      },
      bubbles: true,
      cancelable: true,
    });
    event.target?.dispatchEvent(contextMenuEvent);
  }, [registerMenuItems]);

  const handleClick = useCallback(() => {
    setMenuState(null);
    setMenuItems([]);
  }, []);

  React.useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, [handleContextMenu, handleClick]);

  return (
    <ContextMenuContext.Provider value={{ registerMenuItems }}>
      {children}
      {menuState && menuItems.length > 0 && (
        <ContextMenu
          x={menuState.x}
          y={menuState.y}
          items={menuItems}
          onClose={() => setMenuState(null)}
        />
      )}
    </ContextMenuContext.Provider>
  );
};