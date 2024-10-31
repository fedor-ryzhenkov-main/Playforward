import { Theme } from "design-system/types/types";


export const lightTheme: Theme = {
  colors: {
    main: '#007AFF',
    secondary: '#5856D6',
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      accent: '#E8E8E8',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#007AFF',
      disabled: '#999999',
    },
    border: '#E1E1E1',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      xxxl: 40,
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    }
  },
  breakpoints: [
    '320px',
    '768px',
    '1024px',
    '1280px',
  ]
};
