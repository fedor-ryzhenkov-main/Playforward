type PromptOptions = {
  title: string;
  message: string;
  initialValue?: string;
};

export const usePrompt = () => {
  const { openModal, closeModal } = { openModal: () => {}, closeModal: () => {} };

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
        
      );
    });
  };

  return { prompt };
};