import styled from 'styled-components';
import { Box, BoxProps } from './Box';
import { grid, GridProps as StyledGridProps } from 'styled-system';

export interface GridProps extends BoxProps, StyledGridProps {}

export const Grid = styled(Box)<GridProps>`
  display: grid;
  ${grid}
`;

Grid.displayName = 'Grid'; 