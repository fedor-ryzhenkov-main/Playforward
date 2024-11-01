import { Theme } from "design-system/types/types";
import { lightTheme } from "./default";


export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    main: '#0A84FF',
    secondary: '#5E5CE6',
    background: {
      primary: '#000000',
      secondary: '#1C1C1E',
      accent: '#2C2C2E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#EBEBF5',
      accent: '#0A84FF',
      disabled: '#666666',
    },
    border: '#2C2C2E',
    shadow: 'rgba(0, 0, 0, 0.3)',
    error: '#FF0000',
  },
};
