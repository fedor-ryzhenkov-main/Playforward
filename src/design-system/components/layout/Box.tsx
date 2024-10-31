import styled from 'styled-components';
import shouldForwardProp from '@styled-system/should-forward-prop';
import { SxProps } from '../../types/sx';

import {
  space,
  layout,
  color,
  flexbox,
  border,
  position,
  shadow,
  compose,
  SpaceProps,
  LayoutProps,
  ColorProps,
  FlexboxProps,
  BorderProps,
  PositionProps,
  ShadowProps,
} from 'styled-system';

export interface BoxProps
  extends SpaceProps,
    LayoutProps,
    ColorProps,
    FlexboxProps,
    BorderProps,
    PositionProps,
    ShadowProps {
  as?: keyof JSX.IntrinsicElements;
  sx?: SxProps;
}

const boxStyles = compose(
  space,
  layout,
  color,
  flexbox,
  border,
  position,
  shadow
);

export const Box = styled('div').withConfig({
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'sx',
})<BoxProps>`
  ${boxStyles}
  ${({ sx, theme }) => sx && (typeof sx === 'function' ? sx({ theme }) : sx)}
`;

Box.displayName = 'Box';