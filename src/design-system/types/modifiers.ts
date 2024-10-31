import { Theme } from './types';

export type ModifierFunction = (props: any) => {
  styles?: { [key: string]: any };
  attributes?: { [key: string]: any };
};

export type ModifierConfig = {
  [key: string]: ModifierFunction;
};

export const commonModifiers: ModifierConfig = {
  fullWidth: ({ fullWidth }) => ({
    styles: fullWidth ? {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    } : {},
  }),
  
  disabled: ({ disabled }) => ({
    styles: disabled ? {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    } : {},
    attributes: {
      disabled,
      'aria-disabled': disabled,
    },
  }),
}; 