import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseTagSearchProps {
  onSearchTagsChange: (tags: string) => void;
  allTags: string[];
}

export const useTagSearch = ({ onSearchTagsChange, allTags }: UseTagSearchProps) => {
  const [isTagSearchActive, setIsTagSearchActive] = useState(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Memoize the tag set for faster lookups
  const tagSet = useMemo(() => new Set(currentTags), [currentTags]);

  // Debounced search update
  useEffect(() => {
    const tagString = currentTags.join(',');
    onSearchTagsChange(tagString);
  }, [currentTags, onSearchTagsChange]);

  const handleTagInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tagSet.has(newTag)) {  // Avoid duplicate work if tag already exists
        setCurrentTags(prev => [...prev, newTag]);
      }
      setInputValue('');
    }
  }, [inputValue, tagSet]);

  const removeTag = useCallback((tagToRemove: string) => {
    setCurrentTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  return {
    isTagSearchActive,
    setIsTagSearchActive,
    currentTags,
    inputValue,
    setInputValue,
    handleTagInput,
    removeTag
  };
}; 