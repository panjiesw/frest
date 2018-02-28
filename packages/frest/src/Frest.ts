// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import assign from 'object-assign';
import qs from 'query-string';
import { FrestError } from './FrestError';
import * as t from './types';
import xhr from './xhr';

interface IInternalAfterFetch {
  response: Response;
  request: t.IRequest;
}

export const FREST_DEFAULT_CONFIG: t.IConfig = {
  base: '',
  fetch,
  headers: new Headers(),
  interceptors: {},
  method: 'GET',
};

export class Frest implements t.IFrest {
  private _config: t.IConfig;
  private interceptors: t.IInterceptorSets;

  constructor(config?: t.ConfigType) {
    if (config && typeof config === 'string') {
      this._config = assign({}, FREST_DEFAULT_CONFIG, { base: config });
    } else if (config && typeof config === 'object') {
      this._config = assign({}, FREST_DEFAULT_CONFIG, config);
    } else {
      this._config = assign({}, FREST_DEFAULT_CONFIG);
    }
    this._config.base = this.trimSlashes(this._config.base);
    this.interceptors = {
      after: [],
      before: [],
      error: [],
    };
    if (this._config.interceptors.after) {
      this.interceptors.after = this._config.interceptors.after;
    }
    if (this._config.interceptors.before) {
      this.interceptors.before = this._config.interceptors.before;
    }
    if (this._config.interceptors.error) {
      this.interceptors.error = this._config.interceptors.error;
    }
  }

  public get config(): t.IConfig {
    return this._config;
  }

  public get base(): string {
    return this._config.base;
  }

  public mergeConfig(config: Partial<t.IConfig>) {
    this._config = assign({}, this._config, config);
  }

  public get fetchFn(): typeof window.fetch {
    return this._config.fetch;
  }

  public addAfterResponseInterceptor(interceptor: t.IAfterResponseInterceptor) {
    this.interceptors.after.push(interceptor);
  }

  public addBeforeRequestInterceptor(interceptor: t.IBeforeRequestInterceptor) {
    this.interceptors.before.push(interceptor);
  }

  public addErrorInterceptor(interceptor: t.IErrorInterceptor) {
    this.interceptors.error.push(interceptor);
  }

  public removeAfterResponseInterceptor(
    idOrValue: string | t.IAfterResponseInterceptor,
  ) {
    if (typeof idOrValue === 'string') {
      const idx = this.findInterceptor(this.interceptors.after, idOrValue);
      if (idx > -1) {
        this.interceptors.after.splice(idx, 1);
      }
    } else {
      const idx = this.findInterceptor(this.interceptors.after, idOrValue.id);
      if (idx > -1) {
        this.interceptors.after.splice(idx, 1);
      }
    }
  }

  public removeBeforeRequestInterceptor(
    idOrValue: string | t.IBeforeRequestInterceptor,
  ) {
    if (typeof idOrValue === 'string') {
      const idx = this.findInterceptor(this.interceptors.before, idOrValue);
      if (idx > -1) {
        this.interceptors.before.splice(idx, 1);
      }
    } else {
      const idx = this.findInterceptor(this.interceptors.before, idOrValue.id);
      if (idx > -1) {
        this.interceptors.before.splice(idx, 1);
      }
    }
  }

  public removeErrorInterceptor(idOrValue: string | t.IErrorInterceptor) {
    if (typeof idOrValue === 'string') {
      const idx = this.findInterceptor(this.interceptors.error, idOrValue);
      if (idx > -1) {
        this.interceptors.error.splice(idx, 1);
      }
    } else {
      const idx = this.findInterceptor(this.interceptors.error, idOrValue.id);
      if (idx > -1) {
        this.interceptors.error.splice(idx, 1);
      }
    }
  }

  public request<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { action: 'request' },
    );
    return this.internalRequest<T>(config);
  }

  public post<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'POST', action: 'post' },
    );
    return this.internalRequest<T>(config);
  }
  public create<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'POST', action: 'create' },
    );
    return this.internalRequest<T>(config);
  }

  public get<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'GET', action: 'get' },
    );
    return this.internalRequest<T>(config);
  }
  public read<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'GET', action: 'read' },
    );
    return this.internalRequest<T>(config);
  }

  public put<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'PUT', action: 'put' },
    );
    return this.internalRequest<T>(config);
  }
  public update<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'PUT', action: 'update' },
    );
    return this.internalRequest<T>(config);
  }

  public patch<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'PATCH', action: 'patch' },
    );
    return this.internalRequest<T>(config);
  }

  public delete<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'DELETE', action: 'delete' },
    );
    return this.internalRequest<T>(config);
  }
  public destroy<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'DELETE', action: 'destroy' },
    );
    return this.internalRequest<T>(config);
  }

  public option<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'OPTION', action: 'option' },
    );
    return this.internalRequest<T>(config);
  }

  public upload<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'POST', action: 'upload' },
    );
    if (!(config.body instanceof FormData)) {
      return Promise.reject(
        new TypeError('upload: body must be a FormData object'),
      );
    }
    return this.internalRequest<T>(config);
  }

  public download<T = any>(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest> = {},
  ): Promise<t.IWrappedResponse<T>> {
    const config = assign<t.IRequest, Partial<t.IRequest>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'GET', action: 'download' },
    );
    return this.internalRequest<T>(config);
  }

  private findInterceptor(arr: t.ICommonInterceptor[], id?: string): number {
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

  private internalRequest<T = any>(
    requestConfig: t.IRequest,
  ): Promise<t.IWrappedResponse<T>> {
    return this.doBefore(requestConfig)
      .then(this.doRequest)
      .then(this.doAfter)
      .catch(this.onError(requestConfig));
  }

  private requestConfig(
    pathOrConfig: t.RequestType,
    requestConfig: Partial<t.IRequest>,
  ): t.IRequest {
    const { headers, method } = this._config;
    if (typeof pathOrConfig === 'string' || pathOrConfig instanceof Array) {
      return assign<t.IRequest, Partial<t.IRequest>>(
        {
          headers,
          method,
          path: pathOrConfig,
        },
        requestConfig,
      );
    }
    return assign<t.IRequest, Partial<t.IRequest>>(
      {
        headers,
        method,
        path: '',
      },
      pathOrConfig,
    );
  }

  private getFetchFunc(requestConfig: t.IRequest): typeof fetch {
    if (
      requestConfig.action === 'upload' ||
      requestConfig.action === 'download'
    ) {
      return xhr as any;
    }

    if (typeof requestConfig.fetch === 'function') {
      return requestConfig.fetch;
    } else if (typeof this._config.fetch === 'function') {
      return this._config.fetch;
    }
    throw new FrestError(
      'Fetch API is not available',
      this._config,
      requestConfig,
    );
  }

  private doBefore(config: t.IRequest) {
    return new Promise<t.IRequest>((resolve, reject) => {
      let requestPromise = Promise.resolve<t.IRequest>(config);
      for (const requestInterceptor of this.interceptors.before) {
        requestPromise = requestPromise.then(requestConfig => {
          if (!requestConfig) {
            throw new Error(
              `interceptor id ${
                requestInterceptor.id
              } didn't return request config`,
            );
          }
          return requestInterceptor({
            config: this._config,
            requestConfig,
          });
        });
      }

      requestPromise.then(resolve).catch(e => {
        const cause = typeof e === 'string' ? e : e.message ? e.message : e;
        reject(
          new FrestError(
            `Error in before request interceptor: ${cause}`,
            this._config,
            config,
          ),
        );
      });
    });
  }

  private doRequest = (request: t.IRequest): Promise<IInternalAfterFetch> => {
    let fetchFn: typeof fetch;
    const paths: string[] = request.path
      ? request.path instanceof Array ? request.path : [request.path]
      : [''];

    try {
      fetchFn = this.getFetchFunc(request);
    } catch (error) {
      return Promise.reject(error);
    }

    const query = this.parseQuery(request.query);
    const fullPath = this.trimSlashes(
      `${this._config.base}/${paths.map(encodeURI).join('/')}${query}`,
    );
    return fetchFn(fullPath, request).then<IInternalAfterFetch>(response => ({
      request,
      response,
    }));
  };

  private doAfter = <T = any>(
    afterFetch: IInternalAfterFetch,
  ): Promise<t.IWrappedResponse> => {
    const { response, request } = afterFetch;
    if (!response.ok) {
      return Promise.reject(
        new FrestError(
          `Non OK HTTP response status: ${response.status} - ${
            response.statusText
          }`,
          this._config,
          request,
          { origin: response },
        ),
      );
    }
    let responsePromise: Promise<t.IWrappedResponse<T>> = Promise.resolve({
      origin: response,
    });
    for (const responseInterceptor of this.interceptors.after) {
      responsePromise = responsePromise.then(wrappedResponse => {
        if (!wrappedResponse) {
          throw new Error(
            `interceptor id ${
              responseInterceptor.id
            } didn't return original wrapped response`,
          );
        }
        return responseInterceptor({
          config: this._config,
          wrappedResponse,
        });
      });
    }
    return responsePromise.catch(e => {
      const cause = typeof e === 'string' ? e : e.message ? e.message : e;
      return Promise.reject(
        new FrestError(
          `Error in after response intercepor: ${cause}`,
          this._config,
          request,
          { origin: response },
        ),
      );
    });
  };

  private onError = (requestConfig: t.IRequest) => (e: any): any => {
    let err: t.IFrestError = this.toFestError(e, requestConfig);

    if (this.interceptors.error.length === 0) {
      return Promise.reject(err);
    }

    return new Promise<any>((resolve, reject) => {
      let promise: Promise<void | t.IWrappedResponse<
        any
      > | null> = Promise.resolve(null);
      let recovery: t.IWrappedResponse<any> | null = null;
      for (const errorInterceptor of this.interceptors.error) {
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
            err = this.toFestError(ee, requestConfig);
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

  private parseQuery(query: any): string {
    let q = query || '';
    if (typeof q === 'object') {
      const qq = qs.stringify(q);
      q = qq.length > 0 ? `?${qq}` : '';
    } else if (q !== '') {
      q = q.charAt(0) === '?' ? q : `?${q}`;
    }

    return q;
  }

  private trimSlashes(input: string): string {
    return input.toString().replace(/(^\/+|\/+$)/g, '');
  }

  private toFestError(e: any, requestConfig: t.IRequest): t.IFrestError {
    return !e.config && !e.request
      ? new FrestError(e.message, this._config, requestConfig)
      : e;
  }
}
