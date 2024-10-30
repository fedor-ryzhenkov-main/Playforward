import styled from 'styled-components';
import { Box, BoxProps } from './Box';
import { ThemeSpacing } from 'design-system/types/types';

export interface FlexProps extends BoxProps {
  gap?: keyof ThemeSpacing | number;
}

export const Flex = styled(Box)<FlexProps>`
  display: flex;
  gap: ${({ gap, theme }) => {
    if (typeof gap === 'number') return `${gap * theme.spacing.xs}px`;
    if (gap) return `${theme.spacing[gap]}px`;
    return undefined;
  }};
`;

Flex.displayName = 'Flex';