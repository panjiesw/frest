/**
 * @module frest
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

import Frest from './Frest';

/**
 * Supported HTTP Method
 * @public
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTION';

/**
 * Base config for Frest instance
 * @public
 */
export interface IConfigBase {
  /**
   * The base url for this instance. Defaults to empty string.
   * @public
   */
  base: string;
  /**
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API | Fetch API} function implementation to use.
   * @remarks
   * Useful for example to provide custom `fetch` function or mocking in test.
   * By default use native browser `fetch` function and will fallback to {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest | XMLHttpRequest}
   * if not available.
   * @public
   */
  fetch: typeof fetch;
  /**
   * Default HTTP Method to use if not supplied in request. Defaults to `GET`.
   * @public
   */
  method: HttpMethod;
  /**
   * Default {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers | Headers} to include in each request.
   * @remarks
   * If this Headers contain key which is supplied in request, it will get overridden.
   * @public
   */
  headers: Headers;
  body?:
    | Blob
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array
    | Uint8ClampedArray
    | Float32Array
    | Float64Array
    | DataView
    | ArrayBuffer
    | FormData
    | string
    | null;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  integrity?: string;
  keepalive?: boolean;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  signal?: AbortSignal;
  window?: any;
}

/**
 * Interceptor configuration for Frest instance.
 * @public
 */
export interface IConfigInterceptor {
  /**
   * The interceptors to include in this Frest instance.
   * @remarks
   * Provide each kind (request, response, error) as list in this property.
   * @public
   */
  interceptors: IInterceptorSet;
}

/**
 * The configuration used in a Frest instance.
 * @public
 */
export interface IConfig extends IConfigBase, IConfigInterceptor {}

/**
 * Frest configuration used in constructor and config merge.
 * @remarks
 * Frest instance contains some default configurations, so all
 * configuration properties are optional when used in constructor
 * and {@link Frest.mergeConfig}. They are basically
 * the same as {@link IConfig}.
 * @public
 */
export type ConfigMergeType = Partial<IConfigBase> & {
  /**
   * {@inheritdoc IConfigInterceptor}
   */
  interceptors?: Partial<IInterceptorSet>;
};

/**
 * Frest configuration used in constructor.
 * @remarks
 * It can either be a string of `base` URL or a configuration object of {@link ConfigMergeType}.
 * @public
 */
export type ConfigType = string | ConfigMergeType;

/**
 * Request configuration object.
 * @remarks
 * The request configuration accept any properties. This can be useful for
 * debugging, interceptor, etc. to identify originating request.
 * @public
 */
export interface IRequest extends RequestInit {
  [key: string]: any;
  /**
   * Path relative to {@link IConfigBase.base}.
   * @remarks
   * The full endpoint URL to call is constructed from Frest instance's `base`
   * config and this `path` property. It can be a string, e.g. `/foo/bar` or
   * an array, e.g. `['foo', 'bar']`
   * @public
   */
  path: string | string[];
  /**
   * HTTP request method used in this request.
   * @remarks
   * Defaults to the instance's `method` configuration if not supplied.
   * This is ignored when calling instance's request shortcut methods, in
   * which the HTTP method is set according to the function name, e.g. `get`
   * will use `GET` HTTP method and setting this **won't** override it.
   * @public
   */
  method: HttpMethod;
  /**
   * HTTP request headers used in this request.
   * @remarks
   * The request will include instance's `headers` configuration. Any existing
   * key defined in this request header will override the default headers.
   * @public
   */
  headers: Headers;
  /**
   * Specific action which this request called with.
   * @remarks
   * This is optional and mainly used for debugging purpose. You can provide
   * any value to this and use it in interceptor, logging, etc to identify
   * originating request.
   * Note that for `download` and `upload` method of Frest instance, this
   * is predetermined and can't be overridden
   * @public
   */
  action?: string;
  /**
   * Specific base URL for this request.
   * @remarks
   * Override the instance's `base` configuration for this specific request.
   * @public
   */
  base?: string;
  /**
   * Parameter for this request.
   * @remarks
   * Specify URL query with key-value object or string. This will be appended
   * to the final endpoint URL as query string.
   * @public
   */
  query?: any;
  /**
   * `fetch` function used in this request.
   * @remarks
   * Override instance's `fetch` configuration for this request. Useful for
   * mocking in tests or when you want a customized native fetch function.
   * Note that for `download` and `upload` method of Frest instance, this will
   * be ignored and the request will use `XMLHTTPRequest` to support upload/download
   * progress.
   * @public
   */
  fetch?: typeof fetch;
  /**
   * Skip processing interceptor by its id.
   * @remarks
   * This is mainly used internally by interceptors. By convention, interceptors
   * must honor this config and not modify request/response/error if defined
   * in `skip`.
   * @public
   */
  skip?: string[];
  /**
   * Body param for this request.
   * @remarks
   * Provide request body parameter which will be sent with this request.
   * This can be a `Blob`, `BufferSource`, `FormData`, `URLSearchParams`,
   * or `USVString` object, as per native `fetch` init.
   *
   * Note that a request using the GET or HEAD method cannot have a body.
   * Also for `upload` method of Frest instance, it's required to use
   * `FormData` as body.
   * @public
   */
  body?: any;
  /**
   * Upload progress callback for Frest instance `upload` method.
   * @public
   */
  onUploadProgress?: (ev: ProgressEvent) => any;
  /**
   * Download progress callback for Frest instance `download` method.
   * @public
   */
  onDownloadProgress?: (ev: ProgressEvent) => any;
}

/**
 * Request configuration.
 * @remarks
 * This can be string/array of string as `path` of this request, or
 * a request configuration object of {@link IRequest}
 * @public
 */
export type RequestType = string | string[] | Partial<IRequest>;

/**
 * Response object as a result of successful endpoint call.
 * @remarks
 * Every successful request will return a promise of this object. `T` is
 * type parameter of the `body` property.
 * @public
 */
export interface IResponse<T = any> {
  /**
   * Original `fetch` response.
   * @public
   */
  origin: Response;
  /**
   * The body of this response, if any.
   * @remarks.
   * Note by default, without any response interceptor, this won't exist. It's
   * the responsibility and capability of response interceptor to transform
   * `fetch` response body and put it here for convenience.
   * @public
   */
  body?: T;
}

/**
 * Error object thrown in case of request failure.
 * @remarks
 * Any error happened during a request life-cycle, including non-ok HTTP status,
 * will have this signature.
 * @public
 */
export interface IFrestError {
  /**
   * The message describing this error.
   * @public
   */
  message: string;
  /**
   * Frest instance used when this error happened.
   * @public
   */
  frest: Frest;
  /**
   * The request config used when this error happened.
   * @public
   */
  request: IRequest;
  /**
   * The response when this error happened, if any.
   * @remarks
   * This can be `undefined` because an error may be thrown before the request
   * is made.
   * @public
   */
  response?: IResponse;
}

/**
 * Argument object passed to a request interceptor function.
 * @public
 */
export interface IRequestInterceptorArg {
  /**
   * Frest instance which the request is made with.
   * @public
   */
  frest: Frest;
  /**
   * The request configuration used in this request.
   * @public
   */
  request: IRequest;
}

export interface IResponseInterceptorArg {
  /**
   * Frest instance which the request is made with.
   * @public
   */
  frest: Frest;
  /**
   * The request configuration used in this request.
   * @public
   */
  request: IRequest;
  response: IResponse;
}

/**
 * Common signature all interceptors have
 * @public
 */
export interface ICommonInterceptor {
  /**
   * This interceptor unique identifier
   * @public
   */
  id?: string;
}

/**
 * Request interceptor function signature.
 * @public
 */
export interface IRequestInterceptor extends ICommonInterceptor {
  (input: IRequestInterceptorArg): Promise<IRequest>;
}

/**
 * Response interceptor function signature.
 * @public
 */
export interface IResponseInterceptor extends ICommonInterceptor {
  (input: IResponseInterceptorArg): Promise<IResponse>;
}

/**
 * Error interceptor function signature.
 * @public
 */
export interface IErrorInterceptor extends ICommonInterceptor {
  (error: IFrestError): Promise<IResponse | undefined | null>;
}

/**
 * List of interceptors by its type.
 * @public
 */
export interface IInterceptorSet {
  /**
   * List of response interceptor;
   * @public
   */
  response: IResponseInterceptor[];
  /**
   * List of request interceptor;
   * @public
   */
  request: IRequestInterceptor[];
  /**
   * List of error interceptor;
   * @public
   */
  error: IErrorInterceptor[];
}

/**
 * Interceptor types.
 * @public
 */
export interface IInterceptors {
  /**
   * Response interceptor.
   * @public
   */
  response?: IResponseInterceptor;
  /**
   * Request interceptor.
   * @public
   */
  request?: IRequestInterceptor;
  /**
   * Error interceptor.
   * @public
   */
  error?: IErrorInterceptor;
}
