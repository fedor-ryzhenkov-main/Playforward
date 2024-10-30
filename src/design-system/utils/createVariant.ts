import { variant } from 'styled-system';
import { Theme } from '../types/types';

export const createVariant = <T>(
  variantConfig: { [key: string]: (theme: Theme) => T },
  prop = 'variant'
) =>
  variant({
    prop,
    variants: Object.entries(variantConfig).reduce(
      (acc, [key, variantFn]) => ({
        ...acc,
        [key]: (theme: Theme) => variantFn(theme),
      }),
      {}
    ),
  }); 