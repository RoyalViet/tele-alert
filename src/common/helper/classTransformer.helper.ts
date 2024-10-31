import { plainToClass as pTC } from "class-transformer";

import {
  ClassTransformOptions,
  ClassConstructor,
} from "class-transformer/types";

export function plainToClass<T, V>(
  cls: ClassConstructor<T>,
  plain: V[],
  options?: ClassTransformOptions
): T[];

// eslint-disable-next-line no-redeclare
export function plainToClass<T, V>(
  cls: ClassConstructor<T>,
  plain: V,
  options?: ClassTransformOptions
): T;

// eslint-disable-next-line no-redeclare
export function plainToClass<T, V>(
  cls: ClassConstructor<T>,
  plain: V[] | V,
  options?: ClassTransformOptions
) {
  return pTC(cls, plain, { excludeExtraneousValues: true, ...options });
}
