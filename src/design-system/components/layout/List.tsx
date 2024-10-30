import styled from 'styled-components';
import { Box, BoxProps } from './Box';
import { Theme } from '../../types/types';
import { ThemeSpacing } from '../../types/types';

export interface ListProps extends BoxProps {
  /**
   * Spacing between list items in rem units or theme spacing key
   */
  spacing?: keyof ThemeSpacing | number;
  /**
   * Whether to render list items horizontally
   */
  horizontal?: boolean;
  /**
   * Whether to show list bullets/numbers
   */
  unstyled?: boolean;
}

export interface ListItemProps extends BoxProps {
  /**
   * Whether the item is currently selected
   */
  selected?: boolean;
  /**
   * Whether the item is interactive (shows hover effects)
   */
  interactive?: boolean;
}

export const ListItem = styled(Box).attrs({ as: 'li' })<ListItemProps>`
  ${({ interactive, theme }) => interactive && `
    cursor: pointer;
    transition: background-color 0.2s;
    border-radius: 0.5rem;

    &:hover {
      background-color: ${({ theme }: { theme: Theme }) => theme.colors.background.accent};
    }
  `}

  ${({ selected, theme }: { selected?: boolean; theme: Theme }) => selected && `
    background-color: ${theme.colors.background.accent};
  `}
`;

export const List = styled(Box).attrs<ListProps>(({ unstyled = true, as = 'ul' }) => ({
  as,
}))<ListProps>`
  margin: 0;
  padding: 0;
  list-style: ${({ unstyled }) => unstyled ? 'none' : 'inherit'};
  
  ${({ horizontal }) => horizontal && `
    display: flex;
    flex-direction: row;
    align-items: center;
  `}

  > * + * {
    ${({ spacing, theme, horizontal }: { spacing?: keyof ThemeSpacing | number; theme: Theme; horizontal?: boolean }) => {
      if (typeof spacing === 'number') {
        return horizontal 
          ? `margin-left: ${spacing}rem`
          : `margin-top: ${spacing}rem`;
      }
      if (spacing) {
        return horizontal
          ? `margin-left: ${theme.spacing[spacing]}px`
          : `margin-top: ${theme.spacing[spacing]}px`;
      }
      return horizontal
        ? `margin-left: ${theme.spacing.sm}px`
        : `margin-top: ${theme.spacing.sm}px`;
    }}
  }
`;

List.displayName = 'List';
ListItem.displayName = 'ListItem';

// Default props
List.defaultProps = {
  unstyled: true,
  horizontal: false,
  spacing: 'sm'
};

ListItem.defaultProps = {
  interactive: true,
  selected: false
};