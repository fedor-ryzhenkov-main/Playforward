import { useRef } from 'react';
import { useAppDispatch } from 'store';
import { uploadTrack } from 'store/thunks/playerThunks';
import { Button, Flex } from 'design-system/components';

export const UploadButton = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await dispatch(uploadTrack(file));
      event.target.value = '';
    }
  };

  return (
    <Flex>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/mp3"
        style={{ display: 'none' }}
      />
      <Button onClick={handleClick} variant="primary" size="medium">
        Upload Track
      </Button>
    </Flex>
  );
}; 