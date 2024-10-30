import styled from 'styled-components';
import { Box, BoxProps } from '../layout/Box';

export interface AlertProps extends BoxProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export const Alert = styled(Box)<AlertProps>`
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid;

  ${({ variant = 'info', theme }) => {
    const variants = {
      info: {
        background: theme.colors.background.primary,
        borderColor: theme.colors.main,
        color: theme.colors.text.primary,
      },
      success: {
        background: theme.colors.background.primary,
        borderColor: theme.colors.main,
        color: theme.colors.text.primary,
      },
      warning: {
        background: theme.colors.background.primary,
        borderColor: theme.colors.main,
        color: theme.colors.text.primary,
      },
      error: {
        background: theme.colors.background.primary,
        borderColor: theme.colors.main,
        color: theme.colors.text.primary,
      },
    };
    return variants[variant];
  }}
`;

Alert.displayName = 'Alert'; 