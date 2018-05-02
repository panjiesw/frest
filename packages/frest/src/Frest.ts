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

import qs from 'query-string';
import FrestError from './FrestError';
import {
  ConfigMergeType,
  ConfigType,
  IConfig,
  IErrorInterceptor,
  IInterceptorSet,
  IRequest,
  IRequestInterceptor,
  IResponseInterceptor,
  IInterceptors,
  IResponse,
  ICommonInterceptor,
  IFrestError,
  RequestType,
} from './types';
import xhr from './xhr';

interface IInternalAfterFetch {
  origin: Response;
  request: IRequest;
}

/**
 * Default configuration if Frest instance is created without any configuration.
 * @public
 */
export const DEFAULT_CONFIG: IConfig & {
  interceptors: IInterceptorSet;
} = {
  base: '',
  fetch,
  headers: new Headers(),
  interceptors: { response: [], request: [], error: [] },
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
export default class Frest {
  private _config: IConfig;

  /**
   * Creates an instance of Frest.
   * @param config - _Optional_ Configuration for this instance.
   * Can be string or array of string (in which it'll be the `base` URL for
   * every requests), or a {@link IConfig} object. Defaults to `DEFAULT_CONFIG`
   */
  constructor(config?: ConfigType) {
    if (config && typeof config === 'string') {
      this._config = { ...DEFAULT_CONFIG, base: config };
    } else if (config && typeof config === 'object') {
      const interceptors = {
        ...DEFAULT_CONFIG.interceptors,
        ...config.interceptors,
      };
      this._config = { ...DEFAULT_CONFIG, ...config, interceptors };
    } else {
      this._config = { ...DEFAULT_CONFIG };
    }
    this._config.base = this.trimSlashes(this._config.base);
  }

  /**
   * Get configuration used in this instance.
   */
  public get config(): IConfig {
    return this._config;
  }

  /**
   * Get base URL used in this instance.
   */
  public get base(): string {
    return this._config.base;
  }

  /**
   * Merge this instance config with the one provided here.
   * @param config - Configuration to be merged into this instance's configuration.
   */
  public mergeConfig(config: ConfigMergeType) {
    const interceptors = {
      ...this._config.interceptors,
      ...config.interceptors,
    };
    this._config = { ...this._config, ...config, interceptors };
  }

  /**
   * Get `fetch` function used in this instance.
   * @remarks
   * This can be the native `fetch` API or any function with similar signature.
   */
  public get fetchFn(): typeof window.fetch {
    return this._config.fetch;
  }

  /**
   * Add a response interceptor function to this instance.
   *
   * @param interceptor - The response interceptor function.
   * @param idx - _Optional_ The index position where this interceptor will be put.
   * Interceptors will get executed from lower to higher index.
   */
  public addResponseInterceptor(
    interceptor: IResponseInterceptor,
    idx?: number,
  ) {
    if (idx != null) {
      this._config.interceptors.response.splice(idx, 0, interceptor);
      return;
    }
    this._config.interceptors.response.push(interceptor);
  }

  /**
   * Add a request interceptor function to this instance.
   *
   * @param interceptor - The request interceptor function.
   * @param idx - _Optional_ The index position where this interceptor will be put.
   * Interceptors will get executed from lower to higher index.
   */
  public addRequestInterceptor(interceptor: IRequestInterceptor, idx?: number) {
    if (idx != null) {
      this._config.interceptors.request.splice(idx, 0, interceptor);
      return;
    }
    this._config.interceptors.request.push(interceptor);
  }

  /**
   * Add an error interceptor function to this instance.
   *
   * @param interceptor - The error interceptor function.
   * @param idx - _Optional_ The index position where this interceptor will be put.
   * Interceptors will get executed from lower to higher index.
   */
  public addErrorInterceptor(interceptor: IErrorInterceptor, idx?: number) {
    if (idx != null) {
      this._config.interceptors.error.splice(idx, 0, interceptor);
      return;
    }
    this._config.interceptors.error.push(interceptor);
  }

  /**
   * Add a set object (by its type) of interceptors
   *
   * @param interceptors - Interceptor object by its type.
   */
  public addInterceptors(interceptors: IInterceptors): void {
    const { error, request, response } = interceptors;
    if (error) {
      this.addErrorInterceptor(error);
    }
    if (request) {
      this.addRequestInterceptor(request);
    }
    if (response) {
      this.addResponseInterceptor(response);
    }
  }

  /**
   * Remove a response interceptor from this instance.
   *
   * @param idv - String id of the interceptor or the interceptor function itself.
   */
  public removeResponseInterceptor(idv: string | IResponseInterceptor) {
    this.removeInterceptor('response', idv);
  }

  /**
   * Remove a request interceptor from this instance.
   *
   * @param idv - String id of the interceptor or the interceptor function itself.
   */
  public removeRequestInterceptor(idv: string | IRequestInterceptor) {
    this.removeInterceptor('request', idv);
  }

  /**
   * Remove an error interceptor from this instance.
   *
   * @param idv - String id of the interceptor or the interceptor function itself.
   */
  public removeErrorInterceptor(idv: string | IErrorInterceptor) {
    this.removeInterceptor('error', idv);
  }

  /**
   * Remove interceptors provided in the interceptors object.
   *
   * @param interceptors - Interceptors object.
   */
  public removeInterceptors(interceptors: IInterceptors): void {
    const { error, request, response } = interceptors;
    if (error) {
      this.removeErrorInterceptor(error);
    }
    if (request) {
      this.removeRequestInterceptor(request);
    }
    if (response) {
      this.removeResponseInterceptor(response);
    }
  }

  /**
   * Check whether an interceptor with `id` provided is exist in this instance.
   *
   * @param id - The interceptor's `id` to check.
   * @returns true if the interceptor exist, false otherwise.
   */
  public hasInterceptor(id: string): boolean {
    const interceptors = this._config.interceptors;
    for (const interceptor in interceptors) {
      if (interceptors.hasOwnProperty(interceptor)) {
        const idf = this.findInterceptor(interceptors[interceptor], id);
        if (idf > -1) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get full URL from the provided path and query object/string.
   * @remarks
   * This will use the instance's `base` URL configuration and construct full
   * URL to the provided arguments.
   *
   * @param path - Endpoint path
   * @param query - _Optional_ query object/string to include
   * @returns Full URL to the provided arguments.
   */
  public parsePath(path: string | string[], query?: any): string {
    const paths: string[] = path
      ? path instanceof Array ? path : [path]
      : [''];
    query = this.parseQuery(query);
    return this.trimSlashes(
      `${this._config.base}/${paths.map(encodeURI).join('/')}${query}`,
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
   * @param init - A string, string array, or request configuration object.
   * @param request - _Optional_ request configuration if the first arg is string
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
      method: conf.method || this._config.method,
      action: conf.action || 'request',
    });
  }

  /**
   * Make a request to an endpoint with HTTP `POST` method.
   *
   * @param init - A string, string array, or request configuration object.
   * @param request - _Optional_ request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  public post<T = any>(
    init: RequestType,
    request: Partial<IRequest> = {},
  ): Promise<IResponse<T>> {
    const conf = this.requestConfig(init, request);
    return this.internalRequest<T>({
      ...conf,
      method: 'POST',
      action: conf.action || 'post',
    });
  }

  /**
   * Make a request to an endpoint with HTTP `GET` method.
   *
   * @param init - A string, string array, or request configuration object.
   * @param request - _Optional_ request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  public get<T = any>(
    init: RequestType,
    request: Partial<IRequest> = {},
  ): Promise<IResponse<T>> {
    const conf = this.requestConfig(init, request);
    return this.internalRequest<T>({
      ...conf,
      method: 'GET',
      action: conf.action || 'get',
    });
  }

  /**
   * Make a request to an endpoint with HTTP `PUT` method.
   *
   * @param init - A string, string array, or request configuration object.
   * @param request - _Optional_ request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  public put<T = any>(
    init: RequestType,
    request: Partial<IRequest> = {},
  ): Promise<IResponse<T>> {
    const conf = this.requestConfig(init, request);
    return this.internalRequest<T>({
      ...conf,
      method: 'PUT',
      action: conf.action || 'put',
    });
  }

  /**
   * Make a request to an endpoint with HTTP `PATCH` method.
   *
   * @param init - A string, string array, or request configuration object.
   * @param request - _Optional_ request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  public patch<T = any>(
    init: RequestType,
    request: Partial<IRequest> = {},
  ): Promise<IResponse<T>> {
    const conf = this.requestConfig(init, request);
    return this.internalRequest<T>({
      ...conf,
      method: 'PATCH',
      action: conf.action || 'patch',
    });
  }

  /**
   * Make a request to an endpoint with HTTP `DELETE` method.
   *
   * @param init - A string, string array, or request configuration object.
   * @param request - _Optional_ request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  public delete<T = any>(
    init: RequestType,
    request: Partial<IRequest> = {},
  ): Promise<IResponse<T>> {
    const conf = this.requestConfig(init, request);
    return this.internalRequest<T>({
      ...conf,
      method: 'DELETE',
      action: conf.action || 'delete',
    });
  }

  /**
   * Make a request to an endpoint with HTTP `OPTION` method.
   *
   * @param init - A string, string array, or request configuration object.
   * @param request - _Optional_ request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  public option<T = any>(
    init: RequestType,
    request: Partial<IRequest> = {},
  ): Promise<IResponse<T>> {
    const conf = this.requestConfig(init, request);
    return this.internalRequest<T>({
      ...conf,
      method: 'OPTION',
      action: conf.action || 'option',
    });
  }

  /**
   * Upload something to an endpoint.
   * @remarks
   * This is a special request function which will use `XMLHTTPRequest` to support
   * upload progress. By default the HTTP method used is `POST`. Currently only
   * support request body of `FormData` object.
   *
   * @param init - A string, string array, or request configuration object.
   * @param request - _Optional_ request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  public upload<T = any>(
    init: RequestType,
    request: Partial<IRequest> = {},
  ): Promise<IResponse<T>> {
    const conf = this.requestConfig(init, request);
    if (!(conf.body instanceof FormData)) {
      return Promise.reject(
        new TypeError('upload: body must be a FormData object'),
      );
    }
    return this.internalRequest<T>({
      ...conf,
      method: conf.method || 'POST',
      action: 'upload',
    });
  }

  /**
   * Download something from an endpoint.
   * @remarks
   * This is a special request function which will use `XMLHTTPRequest` to support
   * download progress. By default the HTTP method used is `GET`.
   *
   * @param init - A string, string array, or request configuration object.
   * @param request - _Optional_ request configuration if the first arg is string
   * or string array
   * @returns Response promise which will be resolved when the request is successful.
   * The promise will throws in case of error in any request life-cycle.
   */
  public download<T = any>(
    init: RequestType,
    request: Partial<IRequest> = {},
  ): Promise<IResponse<T>> {
    const conf = this.requestConfig(init, request);
    return this.internalRequest<T>({
      ...conf,
      method: conf.method || 'GET',
      action: 'download',
    });
  }

  private removeInterceptor(
    i: 'response' | 'request' | 'error',
    idv:
      | string
      | IResponseInterceptor
      | IRequestInterceptor
      | IErrorInterceptor,
  ) {
    if (typeof idv === 'string') {
      const idx = this.findInterceptor(this._config.interceptors[i], idv);
      if (idx > -1) {
        this._config.interceptors[i].splice(idx, 1);
      }
    } else {
      const idx = this.findInterceptor(this._config.interceptors[i], idv.id);
      if (idx > -1) {
        this._config.interceptors[i].splice(idx, 1);
      }
    }
  }

  private findInterceptor(arr: ICommonInterceptor[], id?: string): number {
    let found = false;
    let i = 0;
    while (i < arr.length) {
      found = arr[i].id === id;
      if (found) {
        return i;
      }
      i++;
    }
    return -1;
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
    if (typeof init === 'string' || init instanceof Array) {
      this.headers(request);
      return {
        path: init,
        ...request,
      } as any;
    }
    this.headers(init);
    return {
      path: '',
      ...init,
    } as any;
  }

  private headers(request: Partial<IRequest>) {
    if (request.headers) {
      const headers = new Headers(this._config.headers);
      for (const header of request.headers.entries()) {
        headers.set(header[0], header[1]);
      }
    } else {
      request.headers = new Headers(this._config.headers);
    }
  }

  private getFetch(request: IRequest): typeof fetch {
    if (request.action === 'upload' || request.action === 'download') {
      return xhr as any;
    }

    if (typeof request.fetch === 'function') {
      return request.fetch;
    } else if (typeof this._config.fetch === 'function') {
      return this._config.fetch;
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
      for (const requestInterceptor of this._config.interceptors.request) {
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
    for (const responseInterceptor of this._config.interceptors.response) {
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

    if (this._config.interceptors.error.length === 0) {
      return Promise.reject(err);
    }

    return new Promise<any>((resolve, reject) => {
      let promise: Promise<IResponse | undefined | null> = Promise.resolve(
        null,
      );
      let recovery: IResponse | undefined | null = null;
      for (const errorInterceptor of this._config.interceptors.error) {
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

  private trimSlashes(input: string): string {
    return input.toString().replace(/(^\/+|\/+$)/g, '');
  }

  private toFrestError(e: any, requestConfig: IRequest): IFrestError {
    return !e.frest && !e.request
      ? new FrestError(e.message, this, requestConfig)
      : e;
  }
}
