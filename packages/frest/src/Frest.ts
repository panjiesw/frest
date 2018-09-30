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
} from './types';
import xhr from './xhr';
import * as utils from './utils';
import { InterceptorManager } from './InterceptorManager';

interface IInternalAfterFetch {
  origin: Response;
  request: IRequest;
}

/**
 * Default configuration if Frest instance is created without any configuration.
 * @public
 */
let DEFAULT_CONFIG: IConfig = {
  base: '',
  fetch,
  headers: new Headers(),
  method: 'GET',
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
      this.config = { ...DEFAULT_CONFIG, ...config };
    } else {
      this.config = { ...DEFAULT_CONFIG };
    }
    this.config.base = utils.trimSlashes(this.config.base);
  }

  public get defaults(): IConfig {
    return DEFAULT_CONFIG;
  }

  public set defaults(defaults: IConfig) {
    DEFAULT_CONFIG = { ...defaults };
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
    this.config = { ...this.config, ...config };
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
    const conf = this.requestConfig(init, request);
    return this.internalRequest<T>({
      ...conf,
      method: conf.method || this.config.method,
      action: conf.action || 'request',
    });
  }

  private internalRequest<T = any>(request: IRequest): Promise<IResponse<T>> {
    return this.doBefore(request)
      .then(this.doRequest)
      .then(this.doAfter)
      .catch(this.onError(request));
  }

  private requestConfig(
    init: RequestType,
    request: Partial<IRequest>,
  ): IRequest {
    const { fetch, base, method, headers, ...rest } = this.config;
    if (typeof init === 'string' || init instanceof Array) {
      this.headers(request);
      return {
        path: init,
        ...rest,
        ...request,
      } as any;
    }
    this.headers(init);
    return {
      path: '',
      ...rest,
      ...init,
    } as any;
  }

  private headers(request: Partial<IRequest>) {
    if (request.headers) {
      const headers = new Headers(this.config.headers);
      for (const header of request.headers.entries()) {
        headers.set(header[0], header[1]);
      }
    } else {
      request.headers = new Headers(this.config.headers);
    }
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
    if (process.env.NODE_ENV !== 'production') {
      // tslint:disable-next-line:no-console
      console.warn('Frest: Fetch API is not available falling back to xhr');
    }
    return xhr as any;
  }

  private doBefore(request: IRequest) {
    return new Promise<IRequest>((resolve, reject) => {
      let requestPromise = Promise.resolve<IRequest>(request);
      for (const requestInterceptor of this.interceptors.request.handlers) {
        requestPromise = requestPromise.then(requestConfig => {
          if (!requestConfig) {
            throw new Error(
              `interceptor id ${
                requestInterceptor.id
              } didn't return request config`,
            );
          }
          return requestInterceptor({
            frest: this,
            request: requestConfig,
          });
        });
      }

      requestPromise.then(resolve).catch(e => {
        const cause = typeof e === 'string' ? e : e.message ? e.message : e;
        reject(
          new FrestError(
            `Error in request interceptor: ${cause}`,
            this,
            request,
          ),
        );
      });
    });
  }

  private doRequest = (request: IRequest): Promise<IInternalAfterFetch> => {
    let fetchFn: typeof fetch;

    try {
      fetchFn = this.getFetch(request);
    } catch (error) {
      return Promise.reject(error);
    }

    const fullPath = this.parsePath(request.path, request.query);
    return fetchFn(fullPath, request).then<IInternalAfterFetch>(origin => ({
      request,
      origin,
    }));
  };

  private doAfter = <T = any>(
    afterFetch: IInternalAfterFetch,
  ): Promise<IResponse> => {
    const { origin, request } = afterFetch;
    if (!origin.ok) {
      return Promise.reject(
        new FrestError(
          `Non OK HTTP response status: ${origin.status} - ${
            origin.statusText
          }`,
          this,
          request,
          { origin },
        ),
      );
    }
    let responsePromise: Promise<IResponse<T>> = Promise.resolve({
      origin,
    });
    for (const responseInterceptor of this.interceptors.response.handlers) {
      responsePromise = responsePromise.then(response => {
        if (!response) {
          throw new Error(
            `interceptor id ${responseInterceptor.id} didn't return response`,
          );
        }
        return responseInterceptor({
          frest: this,
          request,
          response,
        });
      });
    }
    return responsePromise.catch(e => {
      const cause = typeof e === 'string' ? e : e.message ? e.message : e;
      return Promise.reject(
        new FrestError(
          `Error in response interceptor: ${cause}`,
          this,
          request,
          { origin },
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
      ? new FrestError(e.message, this, requestConfig)
      : e;
  }
}

const mth1 = [
  'get',
  'delete',
  'options',
  'post',
  'put',
  'patch',
  'upload',
  'download',
];
for (const method of mth1) {
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
    const conf = this.requestConfig(init, request);
    return this.internalRequest({
      ...conf,
      method: conf.method || meth,
      action: conf.action || method,
    });
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
