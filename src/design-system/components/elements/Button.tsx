import { space, SpaceProps } from 'styled-system';
import { createComponent } from '../../utils/createComponent';
import { buttonVariants } from '../../types/variants';
import { SxProps } from '../../types/sx';
import { commonModifiers } from '../../types/modifiers';

interface ButtonProps extends SpaceProps {
  variants?: Array<keyof typeof buttonVariants>;
  sx?: SxProps;
}

export const Button = createComponent<ButtonProps>({
  displayName: 'Button',
  tag: 'button',
  systemProps: [space],
  variants: buttonVariants,
  modifiers: commonModifiers,
  defaultProps: {
    variants: ['primary', 'medium']
  },
});