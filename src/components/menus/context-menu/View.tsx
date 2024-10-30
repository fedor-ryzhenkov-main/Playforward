import React from 'react';
import './Styles.css';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onModalOpen: (content: React.ReactNode) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onModalOpen }) => {
  

  return (
    <ul className="context-menu" style={{ top: y, left: x }}>
    
    </ul>
  );
};

export default ContextMenu;