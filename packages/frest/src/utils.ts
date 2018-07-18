import { IFrestError } from './types';

/**
 * Remove multiple occurrence of **forward** slash in a string.
 * This doesn't remove leading and/or trailing slash.
 *
 * e.g. "http://example.com/a//b/" -> "http://example.com/a/b/"
 *
 * @public
 * @param input The string to clean.
 * @returns The `input` string without multiple occurrence of forward slash.
 */
export function trimSlashes(input: string): string {
  return input.toString().replace(/([^:]\/)\/+/g, '$1');
}

/**
 * A TypeScript utility to determine if a potential error is an instance of
 * `FrestError`.
 *
 * @public
 * @param e A potential error to check
 * @returns true if `e` is an instance of `FrestError`. TypeScript will then provide
 * completions of `FrestError` instance type.
 */
export function isFrestError(e: any): e is IFrestError {
  return !e.frest && !e.request;
}
