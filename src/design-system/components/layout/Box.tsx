import { space, layout, color, flexbox, border, position, shadow, compose, ShadowProps, BorderProps, FlexboxProps, ColorProps, LayoutProps, SpaceProps, PositionProps } from 'styled-system';
import { createComponent } from '../../utils/createComponent';
import { SxProps } from '../../types/sx';
import { commonModifiers } from '../../types/modifiers';

export interface BoxProps extends 
  SpaceProps,
  LayoutProps,
  ColorProps,
  FlexboxProps,
  BorderProps,
  PositionProps,
  ShadowProps {
  sx?: SxProps;
  as?: keyof JSX.IntrinsicElements;
}

export const Box = createComponent<BoxProps>({
  displayName: 'Box',
  tag: 'div',
  systemProps: [space, layout, color, flexbox, border, position, shadow],
  modifiers: commonModifiers,
});