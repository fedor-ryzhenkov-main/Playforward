import React from 'react';
import './ContextMenu.css';
import { ContextMenuItem } from './Controller';

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  return (
    <ul className="context-menu" style={{ top: y, left: x }}>
      {items.map((item, index) => (
        <li
          key={index}
          className="context-menu-item"
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
};

export default ContextMenu;