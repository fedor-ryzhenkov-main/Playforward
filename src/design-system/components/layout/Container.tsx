import styled from 'styled-components';
import { Box } from './Box';

export const Container = styled(Box)`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: ${({ theme }) => theme.spacing.md}px;
  padding-right: ${({ theme }) => theme.spacing.md}px;
  max-width: ${({ theme }) => theme.breakpoints[2]};

  @media (min-width: ${({ theme }) => theme.breakpoints[1]}) {
    padding-left: ${({ theme }) => theme.spacing.lg}px;
    padding-right: ${({ theme }) => theme.spacing.lg}px;
  }
`;

Container.displayName = 'Container'; 