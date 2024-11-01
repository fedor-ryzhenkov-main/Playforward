import { typography, space, layout, TypographyProps, SpaceProps, LayoutProps } from 'styled-system';
import { createComponent } from '../../utils/createComponent';
import { inputVariants } from '../../types/variants';
import { commonModifiers } from '../../types/modifiers';
import { SxProps } from '../../types/sx';

interface InputProps extends 
  TypographyProps,
  SpaceProps,
  LayoutProps,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof TypographyProps | keyof SpaceProps | keyof LayoutProps> {
  variants?: Array<keyof typeof inputVariants>;
  sx?: SxProps;
  error?: boolean;
}

export const Input = createComponent<InputProps>({
  displayName: 'Input',
  tag: 'input',
  systemProps: [typography, space, layout],
  variants: inputVariants,
  modifiers: commonModifiers,
  defaultProps: {
    variants: ['default'],
  },
}); 