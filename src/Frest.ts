/**
 * @module frest
 */

import { FrestError } from './FrestError';
import {
  ConfigMergeType,
  ConfigType,
  Config,
  ErrorInterceptor,
  Interceptors,
  FrestRequest,
  RequestInterceptor,
  ResponseInterceptor,
  FrestResponse,
  FrestErrorType,
  RequestType,
  HttpMethod,
  ResponseTransformer,
  RequestTransformer,
} from './types';
import xhr from './xhr';
import * as utils from './utils';
import { InterceptorManager } from './InterceptorManager';

interface InternalAfterFetch {
  raw: Response;
  request: FrestRequest;
}

const methodsNoData: string[] = ['get', 'delete', 'options', 'download'];

const methodsData: string[] = ['post', 'put', 'patch', 'upload'];

const setCt = (headers: Headers, value: string) => {
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', value);
  }
};

const json: ResponseTransformer = raw => {
  const ct = raw.headers.get('Content-Type');
  if (ct && ct.indexOf('application/json') >= 0) {
    return raw
      .clone()
      .json()
      .catch(_ => raw.body);
  }
  return raw.body;
};

const req: RequestTransformer = ({ headers }, data) => {
  if (
    utils.isFormData(data) ||
    utils.isArrayBuffer(data) ||
    utils.isBuffer(data) ||
    utils.isStream(data) ||
    utils.isFile(data) ||
    utils.isBlob(data)
  ) {
    return data;
  }
  if (utils.isArrayBufferView(data)) {
    return data.buffer;
  }
  if (utils.isURLSearchParams(data)) {
    setCt(headers, 'application/x-www-form-urlencoded;charset=utf-8');
    return data.toString();
  }
  if (utils.isObject(data)) {
    setCt(headers, 'application/json;charset=utf-8');
    return JSON.stringify(data);
  }
  return data;
};

const resp = <T = any>(
  raw: Response,
  // tslint:disable-next-line:no-object-literal-type-assertion
  data: T = {} as T,
): FrestResponse<T> => ({
  raw,
  data,
  headers: raw.headers,
  ok: raw.ok,
  redirected: raw.redirected,
  status: raw.status,
  statusText: raw.statusText,
  trailer: raw.trailer,
  type: raw.type,
  url: raw.url,
});

const checkInt = (ret: any, type: 'response' | 'request') => {
  if (!ret) {
    const w = type === 'request' ? `${type} config` : type;
    throw new Error(`one of interceptor didn't return ${w}`);
  }
};

/**
 * Default configuration if Frest instance is created without any configuration.
 * @public
 */
export const DEFAULT_CONFIG: Config = {
  base: '',
  fetch,
  headers: {
    common: new Headers({ Accept: 'application/json, text/plain, */*' }),
    post: new Headers(),
    get: new Headers(),
    put: new Headers(),
    delete: new Headers(),
    patch: new Headers(),
    options: new Headers(),
  },
  method: 'GET',
  transformResponse: [json],
  transformRequest: [req],
};

/**
 * Frest constructor/class signature.
 * @remarks
 * This is only used for UMD build.
 * @public
 */
export interface FrestConstructor {
  new (config?: ConfigType): Frest;
}

/**
 * The main Frest class.
 * @public
 */
class Frest {
  public config: Config;
  public interceptors: Interceptors = {
    request: new InterceptorManager<RequestInterceptor>(),
    response: new InterceptorManager<ResponseInterceptor>(),
    error: new InterceptorManager<ErrorInterceptor>(),
  };

  /**
   * Creates an instance of Frest.
   * @param config - Configuration for this instance.
   * Can be string or array of string (in which it'll be the `base` URL for
   * every requests), or a {@link Config} object. Defaults to `DEFAULT_CONFIG`
   */
  constructor(config?: ConfigType) {
    if (config && typeof config === 'string') {
      this.config = { ...DEFAULT_CONFIG, base: config };
    } else if (config && typeof config === 'object') {
      const headers = {
        ...DEFAULT_CONFIG.headers,
        ...config.headers,
      };
      this.config = { ...DEFAULT_CONFIG, ...config, headers };
    } else {
      this.config = { ...DEFAULT_CONFIG };
    }
    this.config.base = utils.trimSlashes(this.config.base);
  }

  /**
   * Get base URL used in this instance.
   */
  public get base(): string {
    return this.config.base;
  }

  public create(config?: ConfigType) {
    return new Frest(config);
  }

  /**
   * Merge this instance config with the one provided here.
   * @param config - Configuration to be merged into this instance's configuration.
   */
  public mergeConfig(config: ConfigMergeType) {
    const headers = {
      ...this.config.headers,
      ...config.headers,
    };
    this.config = { ...this.config, ...config, headers };
  }

  /**
   * Get `fetch` function used in this instance.
   * @remarks
   * This can be the native `fetch` API or any function with similar signature.
   */
  public get fetchFn(): typeof window.fetch {
    return this.config.fetch;
  }

  /**
   * Get full URL from the provided path and query object/string.
   * @remarks
   * This will use the instance's `base` URL configuration and construct full
   * URL to the provided arguments.
   *
   * @param path - Endpoint path
   * @param query - query object/string to include
   * @returns Full URL to the provided arguments.
   */
  public parsePath(path: string | string[], query?: any): string {
    const paths: string[] = path
      ? path instanceof Array
        ? path
        : [path]
      : [''];
    query = this.parseQuery(query);
    return utils.trimSlashes(
      `${this.config.base}/${paths.map(encodeURI).join('/')}${query}`,
    );
  }

  /**
   * Utility function to parse a query object into string.
   *
   * @remarks
   * This is a shortcut to the `utils.parseQuery` function.
   *
   * @param query - The query to parse. It can be object/string
   * @returns Parsed query string
   */
  public parseQuery(query: any): string {
    return utils.parseQuery(query);
  }

  /**
   * Make a request to an endpoint.
   *
   * @template T - The type of response's body, if any. Defaults to `any`.
   * @param init - A string, string array, or request configuration object.
   * @param request - request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  public request<T = any>(
    init: RequestType,
    request: Partial<FrestRequest> = {},
  ): Promise<FrestResponse<T>> {
    const conf = {
      action: 'request',
      method: this.config.method,
      ...this.requestConfig(init, request),
    };
    return this.internalRequest<T>({ ...conf, headers: this.headers(conf) });
  }

  private internalRequest<T = any>(
    request: FrestRequest,
  ): Promise<FrestResponse<T>> {
    return this.before(request)
      .then(this.req)
      .then(this.after)
      .catch(this.onError(request));
  }

  private requestConfig(init: RequestType, request: Partial<FrestRequest>) {
    const { fetch, base, method, headers, ...rest } = this.config;
    if (typeof init === 'string' || init instanceof Array) {
      return {
        path: init,
        ...rest,
        ...request,
      };
    }
    return {
      path: '',
      ...rest,
      ...init,
    };
  }

  private headers(request: { method: HttpMethod; headers?: Headers }) {
    const method = request.method.toLowerCase();
    const headers = new Headers(this.config.headers.common);
    this.config.headers[method].forEach((v: string, k: string) => {
      headers.set(k, v);
    });
    if (request.headers) {
      request.headers.forEach((v, k) => {
        headers.set(k, v);
      });
    }
    return headers;
  }

  private getFetch(request: FrestRequest): typeof fetch {
    if (request.action === 'upload' || request.action === 'download') {
      return xhr as any;
    }

    if (typeof request.fetch === 'function') {
      return request.fetch;
    } else if (typeof this.config.fetch === 'function') {
      return this.config.fetch;
    }

    throw new FrestError(
      'Fetch API is not available in this browser',
      this,
      request,
    );
  }

  private before(request: FrestRequest) {
    return new Promise<FrestRequest>((resolve, reject) => {
      let dataPromise = Promise.resolve<any>(request.body);
      for (let i = 0; i < request.transformRequest.length; i++) {
        if (methodsData.indexOf(request.method.toLowerCase()) >= 0) {
          dataPromise = dataPromise.then(data =>
            request.transformRequest[i](request, data),
          );
        }
      }

      let requestPromise = dataPromise.then(body => {
        request.body = body;
        return request;
      });

      for (let i = 0; i < this.interceptors.request.handlers.length; i++) {
        requestPromise = requestPromise.then(requestConfig => {
          checkInt(requestConfig, 'request');
          return this.interceptors.request.handlers[i]({
            frest: this,
            request: requestConfig,
          });
        });
      }

      requestPromise
        .then(requestConfig => {
          checkInt(requestConfig, 'request');
          resolve(requestConfig);
        })
        .catch(e => {
          const cause = typeof e === 'string' ? e : e.message ? e.message : e;
          reject(
            new FrestError(
              `Error in request transform/interceptor: ${cause}`,
              this,
              request,
            ),
          );
        });
    });
  }

  private req = (request: FrestRequest): Promise<InternalAfterFetch> => {
    let fetchFn: typeof fetch;

    try {
      fetchFn = this.getFetch(request);
    } catch (error) {
      return Promise.reject(error);
    }

    const fullPath = this.parsePath(request.path, request.query);
    return fetchFn(fullPath, request).then<InternalAfterFetch>(raw => ({
      request,
      raw,
    }));
  };

  private after = (afterFetch: InternalAfterFetch): Promise<FrestResponse> => {
    const { raw, request } = afterFetch;
    let dataPromise = Promise.resolve<any>({});
    for (let i = 0; i < request.transformResponse.length; i++) {
      dataPromise = dataPromise.then(data =>
        request.transformResponse[i](raw, data),
      );
    }

    if (!raw.ok) {
      return dataPromise.then(data =>
        Promise.reject(
          new FrestError(
            `Non OK HTTP response status: ${raw.status} - ${raw.statusText}`,
            this,
            request,
            resp(raw, data),
          ),
        ),
      );
    }

    let responsePromise = dataPromise.then(data => resp(raw, data));

    for (let i = 0; i < this.interceptors.response.handlers.length; i++) {
      responsePromise = responsePromise.then(response => {
        checkInt(response, 'response');
        return this.interceptors.response.handlers[i]({
          frest: this,
          request,
          response,
        });
      });
    }
    return responsePromise
      .then(r => {
        checkInt(r, 'response');
        return r;
      })
      .catch(e => {
        const cause = typeof e === 'string' ? e : e.message ? e.message : e;
        return Promise.reject(
          new FrestError(
            `Error in response transform/interceptor: ${cause}`,
            this,
            request,
            resp(raw),
          ),
        );
      });
  };

  private onError = (request: FrestRequest) => (e: any): any => {
    let err: FrestErrorType = this.toFrestError(e, request);

    if (this.interceptors.error.handlers.length === 0) {
      return Promise.reject(err);
    }

    return new Promise<any>((resolve, reject) => {
      let promise: Promise<FrestResponse | undefined | null> = Promise.resolve(
        null,
      );
      let recovery: FrestResponse | undefined | null = null;
      for (let i = 0; i < this.interceptors.error.handlers.length; i++) {
        if (recovery != null) {
          break;
        }
        promise = promise
          // eslint-disable-next-line no-loop-func
          .then(rec => {
            if (rec != null) {
              recovery = rec;
              return rec;
            }
            return this.interceptors.error.handlers[i](err);
          })
          // eslint-disable-next-line no-loop-func
          .catch(ee => {
            err = this.toFrestError(ee, request);
            return null;
          });
      }
      promise.then(res => {
        if (res) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  };

  private toFrestError(e: any, requestConfig: FrestRequest): FrestErrorType {
    return utils.isFrestError(e)
      ? new FrestError(e.message, this, requestConfig, e.response)
      : e;
  }
}

for (let i = 0; i < methodsNoData.length; i++) {
  const method = methodsNoData[i];
  const meth = method === 'download' ? 'GET' : method.toUpperCase();
  Frest.prototype[method] = function(
    this: any,
    init: RequestType,
    request: Partial<FrestRequest> = {},
  ) {
    const conf = {
      action: method,
      method: meth,
      ...this.requestConfig(init, request),
    };
    return this.internalRequest({ ...conf, headers: this.headers(conf) });
  };
}

for (let i = 0; i < methodsData.length; i++) {
  const method = methodsData[i];
  const meth = method === 'upload' ? 'POST' : method.toUpperCase();
  Frest.prototype[method] = function(
    this: any,
    init: RequestType,
    body?: any,
    request: Partial<FrestRequest> = {},
  ) {
    const conf = {
      action: method,
      method: meth,
      ...this.requestConfig(init, request),
    };
    return this.internalRequest({ body, ...conf, headers: this.headers(conf) });
  };
}

interface Frest {
  /**
   * Make a request to an endpoint with HTTP `POST` method.
   *
   * @template T - The type of response's body, if any. Defaults to `any`.
   * @param init - A string, string array, or request configuration object.
   * @param request - request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  post<T = any>(
    init: RequestType,
    body?: any,
    request?: Partial<FrestRequest>,
  ): Promise<FrestResponse<T>>;

  /**
   * Make a request to an endpoint with HTTP `GET` method.
   *
   * @template T - The type of response's body, if any. Defaults to `any`.
   * @param init - A string, string array, or request configuration object.
   * @param request - request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  get<T = any>(
    init: RequestType,
    request?: Partial<FrestRequest>,
  ): Promise<FrestResponse<T>>;

  /**
   * Make a request to an endpoint with HTTP `PUT` method.
   *
   * @template T - The type of response's body, if any. Defaults to `any`.
   * @param init - A string, string array, or request configuration object.
   * @param request - request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  put<T = any>(
    init: RequestType,
    body?: any,
    request?: Partial<FrestRequest>,
  ): Promise<FrestResponse<T>>;

  /**
   * Make a request to an endpoint with HTTP `PATCH` method.
   *
   * @template T - The type of response's body, if any. Defaults to `any`.
   * @param init - A string, string array, or request configuration object.
   * @param request - request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  patch<T = any>(
    init: RequestType,
    body?: any,
    request?: Partial<FrestRequest>,
  ): Promise<FrestResponse<T>>;

  /**
   * Make a request to an endpoint with HTTP `DELETE` method.
   *
   * @template T - The type of response's body, if any. Defaults to `any`.
   * @param init - A string, string array, or request configuration object.
   * @param request - request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  delete<T = any>(
    init: RequestType,
    request?: Partial<FrestRequest>,
  ): Promise<FrestResponse<T>>;

  /**
   * Make a request to an endpoint with HTTP `OPTIONS` method.
   *
   * @template T - The type of response's body, if any. Defaults to `any`.
   * @param init - A string, string array, or request configuration object.
   * @param request - request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  options<T = any>(
    init: RequestType,
    request?: Partial<FrestRequest>,
  ): Promise<FrestResponse<T>>;

  /**
   * Upload something to an endpoint.
   * @remarks
   * This is a special request function which will use `XMLHTTPRequest` to support
   * upload progress. By default the HTTP method used is `POST`. Currently only
   * support request body of `FormData` object.
   *
   * @template T - The type of response's body, if any. Defaults to `any`.
   * @param init - A string, string array, or request configuration object.
   * @param request - request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  upload<T = any>(
    init: RequestType,
    body?: any,
    request?: Partial<FrestRequest>,
  ): Promise<FrestResponse<T>>;

  /**
   * Download something from an endpoint.
   * @remarks
   * This is a special request function which will use `XMLHTTPRequest` to support
   * download progress. By default the HTTP method used is `GET`.
   *
   * @template T - The type of response's body, if any. Defaults to `any`.
   * @param init - A string, string array, or request configuration object.
   * @param request - request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  download<T = any>(
    init: RequestType,
    request?: Partial<FrestRequest>,
  ): Promise<FrestResponse<T>>;
}

export { Frest };
