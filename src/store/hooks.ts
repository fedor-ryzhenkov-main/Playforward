import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from './types';

// Define AppDispatch type based on store type
export type AppDispatch = any; // This will be inferred from the store

// Export hooks that are typed for the page-level store
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 