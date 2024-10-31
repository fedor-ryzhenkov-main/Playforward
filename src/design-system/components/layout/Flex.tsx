import { createComponent } from '../../utils/createComponent';
import { BoxProps } from './Box';
import { ThemeSpacing } from '../../types/types';

interface FlexProps extends BoxProps {
  gap?: keyof ThemeSpacing | number;
}

export const Flex = createComponent<FlexProps>({
  displayName: 'Flex',
  tag: 'div',
  variants: {
    default: (theme, { gap }) => ({
      styles: {
        display: 'flex',
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