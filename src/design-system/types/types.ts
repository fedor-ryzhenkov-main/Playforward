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

export interface TextVariants {
  title: {
    fontSize: keyof ThemeTypography['fontSize'];
    fontWeight: keyof ThemeTypography['fontWeight'];
    lineHeight: keyof ThemeTypography['lineHeight'];
  };
  subtitle: {
    fontSize: keyof ThemeTypography['fontSize'];
    fontWeight: keyof ThemeTypography['fontWeight'];
    lineHeight: keyof ThemeTypography['lineHeight'];
  };
  body: {
    fontSize: keyof ThemeTypography['fontSize'];
    fontWeight: keyof ThemeTypography['fontWeight'];
    lineHeight: keyof ThemeTypography['lineHeight'];
  };
  caption: {
    fontSize: keyof ThemeTypography['fontSize'];
    fontWeight: keyof ThemeTypography['fontWeight'];
    lineHeight: keyof ThemeTypography['lineHeight'];
  };
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
  variants: TextVariants;
}

export interface ThemeComponents {
  button: {
    variants: ButtonVariants;
    sizes: ButtonSizes;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  breakpoints: string[];
  components: ThemeComponents;
}

export type ThemeColorPaths = 
  | keyof ThemeColors 
  | `background.${keyof ThemeColors['background']}`
  | `text.${keyof ThemeColors['text']}`;

export interface ButtonVariants {
  primary: {
    color: keyof ThemeColors['text'];
    bg: ThemeColorPaths;
    hover: {
      opacity?: number;
      bg?: keyof ThemeColors['background'];
    };
  };
  secondary: {
    color: keyof ThemeColors['text'];
    bg: ThemeColorPaths;
    hover: {
      opacity?: number;
      bg?: keyof ThemeColors['background'];
    };
  };
  ghost: {
    color: keyof ThemeColors['text'];
    bg: 'transparent';
    hover: {
      opacity?: number;
      bg?: keyof ThemeColors['background'];
    };
  };
}

export interface ButtonSizes {
  small: {
    fontSize: keyof ThemeTypography['fontSize'];
    padding: {
      x: keyof ThemeSpacing;
      y: keyof ThemeSpacing;
    };
  };
  medium: {
    fontSize: keyof ThemeTypography['fontSize'];
    padding: {
      x: keyof ThemeSpacing;
      y: keyof ThemeSpacing;
    };
  };
  large: {
    fontSize: keyof ThemeTypography['fontSize'];
    padding: {
      x: keyof ThemeSpacing;
      y: keyof ThemeSpacing;
    };
  };
} 