import { createComponent } from '../../utils/createComponent';
import { BoxProps } from './Box';
import { containerVariants } from '../../types/variants';

export const Container = createComponent<BoxProps>({
  displayName: 'Container',
  tag: 'div',
  variants: {
    default: (theme) => ({
      styles: {
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: `${theme.spacing.md}px`,
        paddingRight: `${theme.spacing.md}px`,
        maxWidth: theme.breakpoints[2],
        [`@media (min-width: ${theme.breakpoints[1]})`]: {
          paddingLeft: `${theme.spacing.lg}px`,
          paddingRight: `${theme.spacing.lg}px`,
        },
      },
    }),
  },
  defaultProps: {
    variants: ['default'],
  },
}); 