// app/src/hooks/usePrompt.tsx
import React from 'react';
import { useModal } from '../contexts/ModalContext';
import PromptModal from '../components/PromptModal/PromptModal';

type PromptOptions = {
  title: string;
  message: string;
  initialValue?: string;
};

export const usePrompt = () => {
  const { openModal, closeModal } = useModal();

  const prompt = (options: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      const handleSubmit = (value: string) => {
        resolve(value);
        closeModal();
      };

      const handleClose = () => {
        resolve(null);
        closeModal();
      };

      openModal(
        <PromptModal
          title={options.title}
          message={options.message}
          initialValue={options.initialValue}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      );
    });
  };

  return { prompt };
};