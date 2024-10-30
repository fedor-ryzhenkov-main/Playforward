import styled, { keyframes } from 'styled-components';
import { Box, BoxProps } from '../layout/Box';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export interface SpinnerProps extends BoxProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: '1rem',
  md: '2rem',
  lg: '3rem',
};

export const Spinner = styled(Box)<SpinnerProps>`
  border: 2px solid ${({ theme }) => theme.colors.background.secondary};
  border-top: 2px solid ${({ theme }) => theme.colors.main};
  border-radius: 50%;
  width: ${({ size = 'md' }) => sizeMap[size]};
  height: ${({ size = 'md' }) => sizeMap[size]};
  animation: ${spin} 1s linear infinite;
`;

Spinner.displayName = 'Spinner'; 