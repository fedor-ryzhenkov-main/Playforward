/**
 * Comprehensive theme type system for programmatic styling
 */
export interface ThemeColors {
  main: string;
  secondary: string;
  background: {
    primary: string;
    secondary: string;
    accent: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
    disabled: string;
  };
  border: string;
  shadow: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeBreakpoints {
  breakpoints: string[];
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  fontWeight: {
    regular: number;
    medium: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  breakpoints: string[];
}

export type ThemeColorPaths = 
  | keyof ThemeColors 
  | `background.${keyof ThemeColors['background']}`
  | `text.${keyof ThemeColors['text']}`;