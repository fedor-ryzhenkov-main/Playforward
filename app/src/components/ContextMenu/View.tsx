import React from 'react';
import './Styles.css';
import {
  ContextMenuItem,
  ActionContextMenuItem,
  ModalContextMenuItem,
  SubmenuContextMenuItem,
  CustomContextMenuItem,
} from '../../contexts/ContextMenuContext';

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  onModalOpen: (content: React.ReactNode) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose, onModalOpen }) => {
  const renderMenuItem = (item: ContextMenuItem, index: number) => {
    switch (item.type) {
      case 'action':
        return (
          <li
            key={index}
            className="context-menu-item"
            onClick={() => {
              (item as ActionContextMenuItem).onClick();
              onClose();
            }}
          >
            {item.label}
          </li>
        );
      case 'modal':
        return (
          <li
            key={index}
            className="context-menu-item"
            onClick={() => {
              onModalOpen((item as ModalContextMenuItem).modalContent());
              onClose();
            }}
          >
            {item.label}
          </li>
        );
      case 'submenu':
        return (
          <li key={index} className="context-menu-item submenu">
            {item.label}
            <ul className="context-submenu">
              {(item as SubmenuContextMenuItem).items.map(renderMenuItem)}
            </ul>
          </li>
        );
      case 'custom':
        return (
          <li key={index} className="context-menu-item">
            {(item as CustomContextMenuItem).render()}
          </li>
        );
      default:
        return null;
    }
  };

  return (
    <ul className="context-menu" style={{ top: y, left: x }}>
      {items.map((item, index) => renderMenuItem(item, index))}
    </ul>
  );
};

export default ContextMenu;