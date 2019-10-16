/**
 * @module frest
 */

import { Frest } from './Frest';
import { InterceptorManager } from './InterceptorManager';

/**
 * Supported HTTP Method
 * @public
 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS';

export interface HeaderConfig {
  common: Headers;
  post: Headers;
  get: Headers;
  put: Headers;
  delete: Headers;
  patch: Headers;
  options: Headers;
}

export type ResponseTransformer = (raw: Response, data: any) => any;
export type RequestTransformer = (req: FrestRequest, data?: any) => any;

/**
 * Base config for Frest instance
 * @public
 */
export interface ConfigBase {
  /**
   * The base url for this instance. Defaults to empty string.
   * @public
   */
  base: string;
  transformResponse: ResponseTransformer[];
  transformRequest: RequestTransformer[];
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
  // /**
  //  * Default {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers | Headers} to include in each request.
  //  * @remarks
  //  * If this Headers contain key which is supplied in request, it will get overridden.
  //  * In native `fetch` API, this can also be a key-value object, but for Frest
  //  * it's **required** to be an instance of `Headers` class.
  //  * @public
  //  */
  // headers: IHeaderConfig;
  /**
   * Default cache mode you want to use for each request: `default`, `no-store`, `reload`, `no-cache`, `force-cache`, or `only-if-cached`.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  cache?: RequestCache;
  /**
   * Default request credentials you want to use for each request: `omit`, `same-origin`, or `include`.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  credentials?: RequestCredentials;
  /**
   * The `keepalive` option can be used to allow the request to outlive the page.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  keepalive?: boolean;
  /**
   * Default mode you want to use for each request, e.g., `cors`, `no-cors`, or `same-origin`.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  mode?: RequestMode;
  /**
   * Default redirect mode to use for each request.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  redirect?: RequestRedirect;
  /**
   * A {@link https://developer.mozilla.org/en-US/docs/Web/API/USVString | USVString} specifying `no-referrer`, `client`, or a URL for each request
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  referrer?: string;
  /**
   * Specifies the value of the referer HTTP header for each request.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  referrerPolicy?: ReferrerPolicy;
  /**
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  signal?: AbortSignal;
}

export interface Config extends ConfigBase {
  /**
   * Default {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers | Headers} to include in each request.
   * @remarks
   * If this Headers contain key which is supplied in request, it will get overridden.
   * In native `fetch` API, this can also be a key-value object, but for Frest
   * it's **required** to be an instance of `Headers` class.
   * @public
   */
  headers: HeaderConfig;
}

/**
 * Frest configuration used in constructor and config merge.
 * @remarks
 * Frest instance contains some default configurations, so all
 * configuration properties are optional when used in constructor
 * and {@link Frest.mergeConfig}. They are basically
 * the same as {@link IConfig}.
 * @public
 */
export type ConfigMergeType = Partial<ConfigBase> & {
  headers?: Partial<HeaderConfig>;
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
 * The request configuration extends from native `fetch` request init options
 * and also accept any properties outside those. This can be useful for
 * debugging, interceptor, etc. to identify originating request.
 *
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
 * request init for more.
 * @public
 */
export interface FrestRequest {
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
  transformResponse: ResponseTransformer[];
  transformRequest: RequestTransformer[];
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
   *
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
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
  /**
   * Response type in case of client is XMLHttpRequest.
   *
   * @remarks
   * If using `download`, this is default to `blob`. Otherwise by default
   * it's `text`.
   */
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
  /**
   * The cache mode you want to use for the request: `default`, `no-store`, `reload`, `no-cache`, `force-cache`, or `only-if-cached`.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  cache?: RequestCache;
  /**
   * The request credentials you want to use for the request: `omit`, `same-origin`, or `include`.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  credentials?: RequestCredentials;
  /**
   * The `keepalive` option can be used to allow the request to outlive the page.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  keepalive?: boolean;
  /**
   * The mode you want to use for the request, e.g., `cors`, `no-cors`, or `same-origin`.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  mode?: RequestMode;
  /**
   * The redirect mode to use for the request.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  redirect?: RequestRedirect;
  /**
   * A {@link https://developer.mozilla.org/en-US/docs/Web/API/USVString | USVString} specifying `no-referrer`, `client`, or a URL for the request
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  referrer?: string;
  /**
   * Specifies the value of the referer HTTP header for the request.
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  referrerPolicy?: ReferrerPolicy;
  /**
   * @remarks
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch | fetch}
   * request init for more.
   * @public
   */
  signal?: AbortSignal;
}

/**
 * Request configuration.
 * @remarks
 * This can be string, array of string as `path` of this request, or
 * a request configuration object of {@link IRequest}
 * @public
 */
export type RequestType = string | string[] | Partial<FrestRequest>;

/**
 * Response object as a result of successful endpoint call.
 * @remarks
 * Every successful request will return a promise of this object. `T` is
 * type parameter of the `body` property.
 *
 * @public
 * @template T - The type of `body` property. Defaults to `any`
 */
export interface FrestResponse<T = any> {
  /**
   * Original `fetch` response.
   * @public
   */
  raw: Response;
  /**
   * The body of this response, if any.
   * @public
   */
  data: T;
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly trailer: Promise<Headers>;
  readonly type: ResponseType;
  readonly url: string;
}

/**
 * Error object thrown in case of request failure.
 * @remarks
 * Any error happened during a request life-cycle, including non-ok HTTP status,
 * will have this signature.
 * @public
 */
export interface FrestErrorType {
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
  request: FrestRequest;
  /**
   * The response when this error happened, if any.
   * @remarks
   * This can be `undefined` because an error may be thrown before the request
   * is made.
   * @public
   */
  response?: FrestResponse;
}

/**
 * Argument object passed to a request interceptor function.
 * @public
 */
export interface RequestInterceptorArg {
  /**
   * Frest instance which the request is made with.
   * @public
   */
  frest: Frest;
  /**
   * The request configuration used in this request.
   * @public
   */
  request: FrestRequest;
}

export interface ResponseInterceptorArg {
  /**
   * Frest instance which the request is made with.
   * @public
   */
  frest: Frest;
  /**
   * The request configuration used in this request.
   * @public
   */
  request: FrestRequest;
  response: FrestResponse;
}

/**
 * Request interceptor function signature.
 * @public
 */
export type RequestInterceptor = (
  input: RequestInterceptorArg,
) => Promise<FrestRequest>;

/**
 * Response interceptor function signature.
 * @public
 */
export type ResponseInterceptor = (
  input: ResponseInterceptorArg,
) => Promise<FrestResponse>;

/**
 * Error interceptor function signature.
 * @public
 */
export type ErrorInterceptor = (
  error: FrestErrorType,
) => Promise<FrestResponse | undefined | null>;

/**
 * List of interceptors by its type.
 * @public
 */
export interface Interceptors {
  /**
   * List of response interceptor;
   * @public
   */
  response: InterceptorManager<ResponseInterceptor>;
  /**
   * List of request interceptor;
   * @public
   */
  request: InterceptorManager<RequestInterceptor>;
  /**
   * List of error interceptor;
   * @public
   */
  error: InterceptorManager<ErrorInterceptor>;
}
