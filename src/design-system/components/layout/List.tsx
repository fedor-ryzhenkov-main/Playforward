import { createComponent } from '../../utils/createComponent';
import { BoxProps } from './Box';
import { ThemeSpacing } from '../../types/types';

interface ListProps extends BoxProps {
  spacing?: keyof ThemeSpacing | number;
  horizontal?: boolean;
  unstyled?: boolean;
}

interface ListItemProps extends BoxProps {
  selected?: boolean;
  interactive?: boolean;
}

export const List = createComponent<ListProps>({
  displayName: 'List',
  tag: 'ul',
  variants: {
    default: (theme, { spacing, horizontal, unstyled = true }) => ({
      styles: {
        margin: 0,
        padding: 0,
        listStyle: unstyled ? 'none' : 'inherit',
        ...(horizontal && {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }),
        '> * + *': spacing 
          ? {
              [horizontal ? 'marginLeft' : 'marginTop']: typeof spacing === 'number'
                ? `${spacing}rem`
                : `${theme.spacing[spacing as keyof ThemeSpacing]}px`,
            }
          : {
              [horizontal ? 'marginLeft' : 'marginTop']: `${theme.spacing.sm}px`,
            },
      },
    }),
  },
  defaultProps: {
    variants: ['default'],
    unstyled: true,
    horizontal: false,
    spacing: 'sm',
  },
});

export const ListItem = createComponent<ListItemProps>({
  displayName: 'ListItem',
  tag: 'li',
  variants: {
    default: (theme, { selected, interactive }) => ({
      styles: {
        ...(interactive && {
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          borderRadius: '0.5rem',
          '&:hover': {
            backgroundColor: theme.colors.background.accent,
          },
        }),
        ...(selected && {
          backgroundColor: theme.colors.background.accent,
        }),
      },
    }),
  },
  defaultProps: {
    variants: ['default'],
    interactive: true,
    selected: false,
  },
});