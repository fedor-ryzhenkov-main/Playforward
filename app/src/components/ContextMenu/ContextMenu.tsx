import React, { useEffect } from 'react';
import './ContextMenu.css';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  useEffect(() => {
    const handleClick = () => {
      onClose();
    };
    const handleScroll = () => {
      onClose();
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onClose]);

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