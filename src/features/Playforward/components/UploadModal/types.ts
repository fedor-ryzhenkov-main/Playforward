export interface UploadFormState {
  name: string;
  description: string;
  tags: string;
  selectedFile: File | null;
  youtubeUrl: string;
  format: string;
}

export interface UploadFormProps {
  formState: UploadFormState;
  onUpload: () => Promise<void>;
  isSubmitting: boolean;
} 