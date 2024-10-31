import { Theme } from './types';
import { CSSObject } from 'styled-components';

type VariantConfig<T> = {
  [key: string]: (theme: Theme, props: any) => Partial<T>;
};

interface VariantStyle {
  styles: CSSObject;
  as?: React.ElementType;
}

export type VariantFunction = (theme: Theme, props: any) => VariantStyle;
export type VariantMap = Record<string, VariantFunction>;

export const textVariants: VariantMap = {
  title: (theme) => ({
    styles: {
      fontSize: `${theme.typography.fontSize.xxxl}px`,
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight.tight,
      color: theme.colors.text.primary,
    },
    as: 'h1',
  }),
  subtitle: (theme) => ({
    styles: {
      fontSize: `${theme.typography.fontSize.lg}px`,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.normal,
      color: theme.colors.text.primary,
    },
    as: 'h2',
  }),
  body: (theme) => ({
    styles: {
      fontSize: `${theme.typography.fontSize.md}px`,
    fontWeight: theme.typography.fontWeight.regular,
      lineHeight: theme.typography.lineHeight.normal,
      color: theme.colors.text.primary,
    },
    as: 'div',
  }),
  caption: (theme) => ({
    styles: {
      fontSize: `${theme.typography.fontSize.sm}px`,
      fontWeight: theme.typography.fontWeight.regular,
      lineHeight: theme.typography.lineHeight.tight,
      color: theme.colors.text.primary,
    },
    as: 'div',
  }),
  link: (theme) => ({
    styles: {
      color: theme.colors.text.accent,
    textDecoration: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: theme.colors.text.accent,
      textDecoration: 'underline',
    },
    '&:focus': {
      outline: `2px solid ${theme.colors.text.accent}`,
      outlineOffset: '2px',
    },
    '&:active': {
      color: theme.colors.text.accent,
    },
    '&:visited': {
      color: theme.colors.text.accent,
      },
    },
    as: 'a',
  }),
};

export const buttonVariants: VariantMap = {
  // **Size Variants**
  small: (theme, props) => ({
    styles: {
      fontSize: theme.typography.fontSize.sm,
      padding: theme.spacing.xs,
      minWidth: theme.spacing.lg,
      minHeight: theme.spacing.lg,
      // If circle variant is active, adjust width and height
      ...(props.variants?.includes('circle') && {
      width: theme.spacing.lg,
      height: theme.spacing.lg,
      minWidth: 'auto',
        minHeight: 'auto',
      }),
    },
  }),

  medium: (theme, props) => ({
    styles: {
      fontSize: theme.typography.fontSize.md,
      padding: theme.spacing.sm,
      minWidth: theme.spacing.lg,
      minHeight: theme.spacing.lg,
      ...(props.variants?.includes('circle') && {
      width: theme.spacing.lg,
      height: theme.spacing.lg,
      minWidth: 'auto',
      minHeight: 'auto',
      }),
    },
  }),

  large: (theme, props) => ({
    styles: {
      fontSize: theme.typography.fontSize.lg,
      padding: theme.spacing.md,
      minWidth: theme.spacing.xl,
      minHeight: theme.spacing.xl,
      ...(props.variants?.includes('circle') && {
      width: theme.spacing.xl,
      height: theme.spacing.xl,
      minWidth: 'auto',
      minHeight: 'auto',
      }),
    },
  }),

  // **Shape Variant**
  circle: (theme) => ({
    styles: {
      borderRadius: '50%',
      padding: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),

  // **Color Variants**
  primary: (theme) => ({
    styles: {
      backgroundColor: theme.colors.main,
      color: theme.colors.text.primary,
      '&:hover': {
      backgroundColor: theme.colors.main,
      },
      cursor: 'pointer'
    },
    as: 'button'
  }),
};

export const containerVariants: VariantMap = {
  default: (theme) => ({
    styles: {
      width: '100%',
    },
  }),
};

export const flexVariants: VariantMap = {
  row: (theme) => ({
    styles: {
      display: 'flex',
      flexDirection: 'row',
    },
  }),
  column: (theme) => ({
    styles: {
      display: 'flex',
      flexDirection: 'column',
    },
  }),
  wrap: (theme) => ({
    styles: {
      flexWrap: 'wrap',
    },
  }),
};

export const gridVariants: VariantMap = {
  default: (theme) => ({
    styles: {
      display: 'grid',
    },
  }),
};

export const listVariants: VariantMap = {
  default: (theme) => ({
    styles: {
      listStyle: 'none',
    },
  }),
};