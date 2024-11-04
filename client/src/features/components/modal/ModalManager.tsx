import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'store';
import { Modal } from 'design-system/components';
import { closeModal } from 'store/modal/modalSlice';
import { Upload } from 'features/playforward/components/Upload';
// Import other modals as needed

const MODAL_COMPONENTS: Record<string, React.FC<any>> = {
  UPLOAD: Upload,
  // Add other modal components here
};

export const ModalManager: React.FC = () => {
  const dispatch = useDispatch();
  const { isOpen, modalType, modalProps } = useSelector(
    (state: RootState) => state.modal
  );

  if (!isOpen || !modalType) {
    return null;
  }

  const SpecificModal = MODAL_COMPONENTS[modalType];

  if (!SpecificModal) {
    console.warn(`No modal component found for type: ${modalType}`);
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(closeModal())}
      size="md"
      title={modalProps?.title || 'Modal'}
    >
      <SpecificModal {...modalProps} />
    </Modal>
  );
}; 