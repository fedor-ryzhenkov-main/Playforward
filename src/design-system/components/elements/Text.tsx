import styled from 'styled-components';
import { typography, space, color, TypographyProps, SpaceProps, ColorProps } from 'styled-system';
import { createVariant } from '../../utils/createVariant';
import { textVariants } from '../../types/variants';
import shouldForwardProp from '@styled-system/should-forward-prop';

export interface TextProps extends TypographyProps, SpaceProps, ColorProps {
  as?: keyof JSX.IntrinsicElements;
  variant?: keyof typeof textVariants;
}

export const Text = styled('p').withConfig({
  shouldForwardProp: (prop) => shouldForwardProp(prop),
})<TextProps>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  ${createVariant(textVariants)}
  ${typography}
  ${space}
  ${color}
`;

Text.defaultProps = {
  variant: 'body',
};