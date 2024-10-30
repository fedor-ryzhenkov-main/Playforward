import styled from 'styled-components';
import { space, SpaceProps } from 'styled-system';
import { createVariant } from '../../utils/createVariant';
import { buttonVariants, buttonSizes } from '../../types/variants';
import { ButtonVariants, ButtonSizes } from '../../types/types';
import shouldForwardProp from '@styled-system/should-forward-prop';

export interface ButtonProps extends SpaceProps {
  variant?: keyof ButtonVariants;
  size?: keyof ButtonSizes;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => shouldForwardProp(prop),
})<ButtonProps>`
  ${space}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: ${props => props.fullWidth ? '100%' : 'auto'};

  ${createVariant(buttonVariants)}
  ${createVariant(buttonSizes, 'size')}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

Button.defaultProps = {
  variant: 'primary',
  size: 'medium',
  fullWidth: false,
};

Button.displayName = 'Button';