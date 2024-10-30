import styled from 'styled-components';
import { Box, BoxProps } from '../layout/Box';

export interface BadgeProps extends BoxProps {
  variant?: 'primary' | 'secondary' | 'error' | 'success';
}

export const Badge = styled(Box)<BadgeProps>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.xs}px ${theme.spacing.sm}px`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  
  ${({ variant = 'primary', theme }) => {
    const variants = {
      primary: {
        background: theme.colors.background.primary,
        color: theme.colors.main,
      },
      secondary: {
        background: theme.colors.background.secondary,
        color: theme.colors.text.secondary,
      },
      error: {
        background: theme.colors.background.primary,
        color: theme.colors.text.primary,
      },
      success: {
        background: theme.colors.background.primary,
        color: theme.colors.text.primary,
      },
    };
    return variants[variant];
  }}
`;

Badge.displayName = 'Badge'; 