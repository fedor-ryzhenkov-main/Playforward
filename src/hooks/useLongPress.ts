// app/src/hooks/useLongPress.ts
import { useState, useCallback, useRef } from 'react';

interface LongPressOptions {
  shouldPreventDefault?: boolean;
  delay?: number;
}

export const useLongPress = (
  onLongPress: (event: TouchEvent | MouseEvent) => void,
  onClick: (event: TouchEvent | MouseEvent) => void,
  { shouldPreventDefault = true, delay = 500 }: LongPressOptions = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const targetRef = useRef<EventTarget | null>(null);

  const start = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (shouldPreventDefault && event.target) {
        targetRef.current = event.target;
        targetRef.current.addEventListener('contextmenu', preventDefault, {
          passive: false,
        });
      }
      timeoutRef.current = window.setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: TouchEvent | MouseEvent, shouldTriggerClick = true) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (shouldTriggerClick && !longPressTriggered) {
        onClick(event);
      }
      setLongPressTriggered(false);
      if (shouldPreventDefault && targetRef.current) {
        targetRef.current.removeEventListener('contextmenu', preventDefault);
      }
    },
    [onClick, longPressTriggered, shouldPreventDefault]
  );

  const preventDefault = (event: Event) => {
    if (!shouldPreventDefault) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    onMouseDown: (e: MouseEvent) => start(e),
    onTouchStart: (e: TouchEvent) => start(e),
    onMouseUp: (e: MouseEvent) => clear(e),
    onMouseLeave: (e: MouseEvent) => clear(e, false),
    onTouchEnd: (e: TouchEvent) => clear(e),
  };
};