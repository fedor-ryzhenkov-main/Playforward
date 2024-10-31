import { grid, GridProps as StyledGridProps } from 'styled-system';
import { createComponent } from '../../utils/createComponent';
import { BoxProps } from './Box';
import { ThemeSpacing } from '../../types/types';

interface GridProps extends BoxProps, StyledGridProps {
  gap?: keyof ThemeSpacing | number;
}

export const Grid = createComponent<GridProps>({
  displayName: 'Grid',
  tag: 'div',
  systemProps: [grid],
  variants: {
    default: (theme, { gap }) => ({
      styles: {
        display: 'grid',
        gap: gap 
          ? typeof gap === 'number'
            ? `${gap * theme.spacing.xs}px`
            : `${theme.spacing[gap as keyof ThemeSpacing]}px`
          : undefined,
      },
    }),
  },
  defaultProps: {
    variants: ['default'],
  },
});