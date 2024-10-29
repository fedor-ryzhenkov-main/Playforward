// app/src/contexts/ModalContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
  } from 'react';
  import Modal from '../components/modals/modal/Modal';
  
  interface ModalContextProps {
    openModal: (content: React.ReactNode) => void;
    closeModal: () => void;
  }
  
  const ModalContext = createContext<ModalContextProps | undefined>(undefined);
  
  export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
      throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
  };
  
  export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  
    const openModal = useCallback((content: React.ReactNode) => {
      setModalContent(content);
    }, []);
  
    const closeModal = useCallback(() => {
      setModalContent(null);
    }, []);
  
    return (
      <ModalContext.Provider value={{ openModal, closeModal }}>
        {children}
        {modalContent && (
          <Modal isOpen={true} onClose={closeModal}>
            {modalContent}
          </Modal>
        )}
      </ModalContext.Provider>
    );
  };