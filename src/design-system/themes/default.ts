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
    },
    variants: {
      title: {
        fontSize: 'xl',
        fontWeight: 'bold',
        lineHeight: 'tight',
      },
      subtitle: {
        fontSize: 'lg',
        fontWeight: 'medium',
        lineHeight: 'normal',
      },
      body: {
        fontSize: 'md',
        fontWeight: 'regular',
        lineHeight: 'normal',
      },
      caption: {
        fontSize: 'sm',
        fontWeight: 'regular',
        lineHeight: 'tight',
      },
    },
  },
  breakpoints: [
    '320px',
    '768px',
    '1024px',
    '1280px',
  ],
  components: {
    button: {
      variants: {
        primary: {
          color: 'primary',
          bg: 'main',
          hover: {
            opacity: 0.9
          }
        },
        secondary: {
          color: 'primary',
          bg: 'background.secondary',
          hover: {
            bg: 'accent'
          }
        },
        ghost: {
          color: 'primary',
          bg: 'transparent',
          hover: {
            bg: 'accent'
          }
        }
      },
      sizes: {
        small: {
          fontSize: 'sm',
          padding: {
            x: 'sm',
            y: 'xs'
          }
        },
        medium: {
          fontSize: 'md',
          padding: {
            x: 'md',
            y: 'sm'
          }
        },
        large: {
          fontSize: 'lg',
          padding: {
            x: 'lg',
            y: 'md'
          }
        }
      }
    }
  }
};
