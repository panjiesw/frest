/**
 * @module frest
 */

import qs from 'query-string';
import { FrestError } from './FrestError';
import {
  ConfigMergeType,
  ConfigType,
  IConfig,
  IErrorInterceptor,
  IInterceptors,
  IRequest,
  IRequestInterceptor,
  IResponseInterceptor,
  IResponse,
  IFrestError,
  RequestType,
  HttpMethod,
  ResponseTransformer,
  RequestTransformer,
} from './types';
import xhr from './xhr';
import * as utils from './utils';
import { InterceptorManager } from './InterceptorManager';

interface IInternalAfterFetch {
  raw: Response;
  request: IRequest;
}

const methodsNoData: string[] = ['get', 'delete', 'options'];

const methodsData: string[] = ['post', 'put', 'patch'];

const methodsFall: string[] = ['upload', 'download'];

const methods = [...methodsNoData, ...methodsData, ...methodsFall];

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
): IResponse<T> => {
  const { body, bodyUsed, ...rest } = raw;
  return {
    raw,
    ...rest,
    data,
  };
};

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
export const DEFAULT_CONFIG: IConfig = {
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
  public config: IConfig;
  public interceptors: IInterceptors = {
    request: new InterceptorManager<IRequestInterceptor>(),
    response: new InterceptorManager<IResponseInterceptor>(),
    error: new InterceptorManager<IErrorInterceptor>(),
  };

  /**
   * Creates an instance of Frest.
   * @param config - Configuration for this instance.
   * Can be string or array of string (in which it'll be the `base` URL for
   * every requests), or a {@link IConfig} object. Defaults to `DEFAULT_CONFIG`
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
   * Utility function to parse a query object into string
   *
   * @param query - The query to parse. It can be object/string
   * @returns Parsed query string
   */
  public parseQuery(query: any): string {
    let q = query || '';
    if (typeof q === 'object') {
      const qq = qs.stringify(q);
      q = qq.length > 0 ? `?${qq}` : '';
    } else if (q !== '') {
      q = q.charAt(0) === '?' ? q : `?${q}`;
    }
    return q;
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
    request: Partial<IRequest> = {},
  ): Promise<IResponse<T>> {
    const conf = {
      action: 'request',
      method: this.config.method,
      ...this.requestConfig(init, request),
    };
    return this.internalRequest<T>({ ...conf, headers: this.headers(conf) });
  }

  private internalRequest<T = any>(request: IRequest): Promise<IResponse<T>> {
    return this.before(request)
      .then(this.req)
      .then(this.after)
      .catch(this.onError(request));
  }

  private requestConfig(init: RequestType, request: Partial<IRequest>) {
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
    for (const header of this.config.headers[method].entries()) {
      headers.set(header[0], header[1]);
    }
    if (request.headers) {
      for (const header of request.headers.entries()) {
        headers.set(header[0], header[1]);
      }
    }
    return headers;
  }

  private getFetch(request: IRequest): typeof fetch {
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

  private before(request: IRequest) {
    return new Promise<IRequest>((resolve, reject) => {
      let dataPromise = Promise.resolve<any>(request.body);
      for (const transform of request.transformRequest) {
        if (methodsData.indexOf(request.method.toLowerCase()) >= 0) {
          dataPromise = dataPromise.then(data => transform(request, data));
        }
      }

      let requestPromise = dataPromise.then(body => {
        request.body = body;
        return request;
      });

      for (const requestInterceptor of this.interceptors.request.handlers) {
        requestPromise = requestPromise.then(requestConfig => {
          checkInt(requestConfig, 'request');
          return requestInterceptor({
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

  private req = (request: IRequest): Promise<IInternalAfterFetch> => {
    let fetchFn: typeof fetch;

    try {
      fetchFn = this.getFetch(request);
    } catch (error) {
      return Promise.reject(error);
    }

    const fullPath = this.parsePath(request.path, request.query);
    return fetchFn(fullPath, request).then<IInternalAfterFetch>(raw => ({
      request,
      raw,
    }));
  };

  private after = (afterFetch: IInternalAfterFetch): Promise<IResponse> => {
    const { raw, request } = afterFetch;
    let dataPromise = Promise.resolve<any>({});
    for (const transform of request.transformResponse) {
      dataPromise = dataPromise.then(data => transform(raw, data));
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

    for (const responseInterceptor of this.interceptors.response.handlers) {
      responsePromise = responsePromise.then(response => {
        checkInt(response, 'response');
        return responseInterceptor({
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

  private onError = (request: IRequest) => (e: any): any => {
    let err: IFrestError = this.toFrestError(e, request);

    if (this.interceptors.error.handlers.length === 0) {
      return Promise.reject(err);
    }

    return new Promise<any>((resolve, reject) => {
      let promise: Promise<IResponse | undefined | null> = Promise.resolve(
        null,
      );
      let recovery: IResponse | undefined | null = null;
      for (const errorInterceptor of this.interceptors.error.handlers) {
        if (recovery != null) {
          break;
        }
        promise = promise
          .then(rec => {
            if (rec != null) {
              recovery = rec;
              return rec;
            }
            return errorInterceptor(err);
          })
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

  private toFrestError(e: any, requestConfig: IRequest): IFrestError {
    return utils.isFrestError(e)
      ? new FrestError(e.message, this, requestConfig, e.response)
      : e;
  }
}

for (const method of methods) {
  const meth =
    method === 'download'
      ? 'GET'
      : method === 'upload'
        ? 'POST'
        : method.toUpperCase();
  Frest.prototype[method] = function(
    this: any,
    init: RequestType,
    request: Partial<IRequest> = {},
  ) {
    const conf = {
      action: method,
      method: meth,
      ...this.requestConfig(init, request),
    };
    return this.internalRequest({ ...conf, headers: this.headers(conf) });
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
    request?: Partial<IRequest>,
  ): Promise<IResponse<T>>;

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
    request?: Partial<IRequest>,
  ): Promise<IResponse<T>>;

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
    request?: Partial<IRequest>,
  ): Promise<IResponse<T>>;

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
    request?: Partial<IRequest>,
  ): Promise<IResponse<T>>;

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
    request?: Partial<IRequest>,
  ): Promise<IResponse<T>>;

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
    request?: Partial<IRequest>,
  ): Promise<IResponse<T>>;

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
    request?: Partial<IRequest>,
  ): Promise<IResponse<T>>;

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
    request?: Partial<IRequest>,
  ): Promise<IResponse<T>>;
}

export { Frest };
