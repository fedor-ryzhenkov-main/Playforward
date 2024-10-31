import { typography, space, color, TypographyProps, SpaceProps, ColorProps } from 'styled-system';
import { createComponent } from '../../utils/createComponent';
import { textVariants } from '../../types/variants';
import { commonModifiers } from '../../types/modifiers';
import { SxProps } from '../../types/sx';

interface TextProps extends 
  TypographyProps, 
  SpaceProps, 
  ColorProps,
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof TypographyProps | keyof SpaceProps | keyof ColorProps> {
  variants?: Array<keyof typeof textVariants>;
  sx?: SxProps;
  as?: keyof JSX.IntrinsicElements;
}

export const Text = createComponent<TextProps>({
  displayName: 'Text',
  tag: 'p',
  systemProps: [typography, space, color],
  variants: textVariants,
  modifiers: commonModifiers,
  defaultProps: {
    variants: ['body'],
  },
});