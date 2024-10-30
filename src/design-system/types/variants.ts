import { Theme } from './types';

type VariantConfig<T> = {
  [key: string]: (theme: Theme) => T;
};

export const textVariants: VariantConfig<{
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
}> = {
  title: (theme) => ({
    fontSize: `${theme.typography.fontSize.xxxl}px`,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.typography.lineHeight.tight,
  }),
  subtitle: (theme) => ({
    fontSize: `${theme.typography.fontSize.lg}px`,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.typography.lineHeight.normal,
  }),
  body: (theme) => ({
    fontSize: `${theme.typography.fontSize.md}px`,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight: theme.typography.lineHeight.normal,
  }),
  caption: (theme) => ({
    fontSize: `${theme.typography.fontSize.sm}px`,
    fontWeight: theme.typography.fontWeight.regular,
    lineHeight: theme.typography.lineHeight.tight,
  }),
};

export const buttonVariants: VariantConfig<{
  color: string;
  backgroundColor: string;
  '&:hover'?: {
    opacity?: number;
    backgroundColor?: string;
  };
}> = {
  primary: (theme) => ({
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.main,
    '&:hover': {
      opacity: 0.9,
    },
  }),
  secondary: (theme) => ({
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
    '&:hover': {
      backgroundColor: theme.colors.background.accent,
    },
  }),
  ghost: (theme) => ({
    color: theme.colors.text.primary,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: theme.colors.background.accent,
    },
  }),
};

export const buttonSizes: VariantConfig<{
  fontSize: string;
  padding: string;
}> = {
  small: (theme) => ({
    fontSize: `${theme.typography.fontSize.sm}px`,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
  }),
  medium: (theme) => ({
    fontSize: `${theme.typography.fontSize.md}px`,
    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
  }),
  large: (theme) => ({
    fontSize: `${theme.typography.fontSize.lg}px`,
    padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
  }),
}; 