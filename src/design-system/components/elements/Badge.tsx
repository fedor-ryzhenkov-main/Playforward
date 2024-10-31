import styled from 'styled-components';
import { Box, BoxProps } from '../layout/Box';

export interface BadgeProps extends BoxProps {
  variant?: 'primary' | 'secondary' | 'error' | 'success';
}

export const Badge = styled(Box)<BadgeProps>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.xs}px ${theme.spacing.xs}px`};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
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