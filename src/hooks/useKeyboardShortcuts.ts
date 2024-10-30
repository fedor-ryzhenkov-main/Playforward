import { useEffect, useRef } from 'react';

export interface ShortcutConfig {
  key: string;
  metaKey?: boolean;
  shiftKey?: boolean;
  handler: (e: KeyboardEvent | React.KeyboardEvent<HTMLInputElement>) => void;
}

export const useKeyboardShortcuts = (
  shortcuts: ShortcutConfig[],
  targetRef?: React.RefObject<HTMLElement>
) => {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcutsRef.current.forEach((shortcut) => {
        const metaMatches =
          shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;
        const shiftMatches =
          shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;

        if (
          event.key === shortcut.key &&
          metaMatches &&
          shiftMatches
        ) {
          shortcut.handler(event);
        }
      });
    };
    const targetElement: EventTarget = targetRef?.current || window;
    targetElement.addEventListener('keydown', handleKeyDown as EventListener);
    return () => targetElement.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [targetRef]);
}; 