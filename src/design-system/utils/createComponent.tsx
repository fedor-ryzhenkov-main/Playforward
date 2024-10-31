import React from 'react';
import styled, { useTheme } from 'styled-components';
import { compose } from 'styled-system';
import { SxProps } from '../types/sx';
import { ModifierConfig } from '../types/modifiers';
import { VariantMap } from '../types/variants';

interface CreateComponentConfig<P> {
  displayName: string;
  tag: React.ElementType;
  variants?: VariantMap;
  modifiers?: ModifierConfig;
  systemProps?: any[];
  defaultProps?: Partial<P & { sx?: SxProps; variants?: string[] }>;
}

interface BaseProps {
  sx?: SxProps;
  variants?: string[];
}

type HTMLProperties<T, P> = Omit<React.HTMLAttributes<T>, keyof P>;

export const createComponent = <P extends Record<string, any>>({
  displayName,
  tag,
  variants,
  modifiers = {},
  systemProps = [],
  defaultProps = {},
}: CreateComponentConfig<P>) => {
  const StyledBase = styled(tag)`
    ${systemProps.length > 0 && compose(...systemProps)}
    ${({ variants: variantNames = [], theme, ...props }: any) =>
      variants && variantNames.length > 0
        ? variantNames.reduce((acc: any, name: string | number) => ({
            ...acc,
            ...variants[name]?.(theme, props)?.styles,
          }), {})
        : null}
    ${({ sx, theme }: any) =>
      sx && (typeof sx === 'function' ? sx({ theme }) : sx)}
  `;

  const Component = React.forwardRef<
    HTMLElement,
    P & 
    HTMLProperties<HTMLElement, P> & 
    BaseProps & {
      children?: React.ReactNode;
    }
  >((props, ref) => {
    const theme = useTheme();
    const mergedProps = { ...defaultProps, ...props };
    const { style, ref: _ref, variants: variantNames = [], as: asProp, ...restProps } = mergedProps;

    const safeVariantNames = (variantNames || []) as string[];
    
    const variantAs = variants 
      ? safeVariantNames
          .map(name => variants[name]?.(theme, restProps)?.as)
          .find(Boolean)
      : undefined;

    const elementTag = asProp || variantAs || tag;

    const modifierStyles = Object.entries(modifiers).reduce(
      (acc, [_, fn]) => ({
        ...acc,
        ...fn(mergedProps)?.styles,
      }),
      {}
    );

    const modifierAttributes = Object.entries(modifiers).reduce(
      (acc, [_, fn]) => ({
        ...acc,
        ...fn(mergedProps)?.attributes,
      }),
      {}
    );

    return (
      <StyledBase
        as={elementTag}
        ref={ref}
        variants={safeVariantNames}
        style={{ ...style, ...modifierStyles }}
        {...modifierAttributes}
        {...restProps}
      />
    );
  });

  Component.displayName = displayName;

  return Component;
};