import { FrestErrorType } from './types';

const toString = Object.prototype.toString;

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
export const trimSlashes = (input: string) =>
  input.toString().replace(/([^:]\/)\/+/g, '$1');

/**
 * A TypeScript utility to determine if a potential error is an instance of
 * `FrestError`.
 *
 * @public
 * @param e A potential error to check
 * @returns true if `e` is an instance of `FrestError`. TypeScript will then provide
 * completions of `FrestError` instance type.
 */
export const isFrestError = (e: any): e is FrestErrorType =>
  e.frest != null && e.request != null;

/**
 * Determine if an object is a Buffer.
 * @remarks
 * Taken from `is-buffer` package by Feross Aboukhadijeh <https://feross.org>,
 * licensed under MIT and copied here to provide typings for Frest and
 * its users.
 *
 * {@link https://github.com/feross/is-buffer}
 *
 * @public
 * @param val Value to test.
 * @returns true if it's a Buffer.
 */
export const isBuffer = (val?: any): val is Buffer =>
  val != null &&
  val.constructor != null &&
  typeof val.constructor.isBuffer === 'function' &&
  val.constructor.isBuffer(val);

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param val The value to test
 * @returns True if value is an ArrayBuffer, otherwise false
 */
export const isArrayBuffer = (val?: any): val is ArrayBuffer =>
  toString.call(val) === '[object ArrayBuffer]';

/**
 * Determine if a value is a FormData
 *
 * @param val The value to test
 * @returns True if value is an FormData, otherwise false
 */
export const isFormData = (val?: any): val is FormData =>
  typeof FormData !== 'undefined' && val instanceof FormData;

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param val The value to test
 * @returns True if value is a view on an ArrayBuffer, otherwise false
 */
export const isArrayBufferView = (val?: any): val is ArrayBufferView => {
  let result;
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && val.buffer instanceof ArrayBuffer;
  }
  return result;
};

// These utilities below are all taken from axios' source authored by
// Matt Zabriskie under MIT License.

/**
 * Determine if a value is an Object
 *
 * @param val The value to test
 * @returns True if value is an Object, otherwise false
 */
export const isObject = (val?: any) => val !== null && typeof val === 'object';

/**
 * Determine if a value is a File
 *
 * @param val The value to test
 * @returns True if value is a File, otherwise false
 */
export const isFile = (val?: any): val is File =>
  toString.call(val) === '[object File]';

/**
 * Determine if a value is a Blob
 *
 * @param val The value to test
 * @returns True if value is a Blob, otherwise false
 */
export const isBlob = (val?: any): val is Blob =>
  toString.call(val) === '[object Blob]';

/**
 * Determine if a value is a Function
 *
 * @param val The value to test
 * @returns True if value is a Function, otherwise false
 */
export const isFunction = (val?: any): val is (...args: any[]) => any =>
  toString.call(val) === '[object Function]';

/**
 * Determine if a value is a Stream
 *
 * @param val The value to test
 * @returns True if value is a Stream, otherwise false
 */
export const isStream = (val?: any) => isObject(val) && isFunction(val.pipe);

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param val The value to test
 * @returns True if value is a URLSearchParams object, otherwise false
 */
export const isURLSearchParams = (val?: any): val is URLSearchParams =>
  typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
