/**
 * @module frest-json
 */
/**
 *    Copyright 2018 Panjie Setiawan Wicaksono
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import { HttpMethod } from 'frest';

/**
 * Options for JSON request interceptor factory.
 */
export interface IJSONRequestInterceptorOption {
  /**
   * Customize `Content-Type` header to use if the request body is plain object.
   * @default "application/json"
   */
  headerContent?: string;
  /**
   * Customize `Accept` header to **append**.
   * @default "application/json"
   */
  headerAccept?: string;
  /**
   * Whitelist HTTP method the request is made with that this interceptor will be applied to.
   * Will be applied to all method if not specified.
   */
  method?: HttpMethod[];
}

/**
 * Response transformation function signature.
 *
 * @param response - The `fetch` response object.
 * @returns string promise
 */
export type IJSONTransformFn = (response: Response) => Promise<string>;

/**
 * Options for JSON response interceptor factory.
 */
export interface IJSONResponseInterceptorOption {
  /**
   * Force JSON parsing.
   * @remarks
   * By default this interceptor will only parse JSON response if
   * the `Content-Type` response header is compatible with
   * `application/json` or the one specified in {@link headerContent}.
   * By setting `force` to true, it'll parse regardless the header.
   */
  force?: boolean;
  /**
   * Customize response `Content-Type` header to enable JSON parsing.
   * @default "application/json"
   */
  headerContent?: string;
  /**
   * Set transformation function to transform response body to text/string.
   * @remarks
   * You can modify the response string before `JSON.parse` process.
   * The function will receive the `fetch` response and must return
   * a promise of string.
   */
  transform?: IJSONTransformFn;
}

/**
 * Options for JSON error interceptor factory.
 */
export interface IJSONErrorInterceptorOption {
  /**
   * Customize response `Content-Type` header to enable JSON parsing.
   * @default "application/json"
   */
  headerContent?: string;
}

/**
 * Options for interceptor factory to create all JSON interceptors.
 */
export interface IJSONInterceptorsOptions {
  /**
   * Options for JSON error interceptor function.
   * @remarks
   * The interceptor will not be created if not specified.
   */
  error?: IJSONErrorInterceptorOption;
  /**
   * Options for JSON request interceptor function.
   * @remarks
   * The interceptor will not be created if not specified.
   */
  request?: IJSONRequestInterceptorOption;
  /**
   * Options for JSON response interceptor function.
   * @remarks
   * The interceptor will not be created if not specified.
   */
  response?: IJSONResponseInterceptorOption;
}
