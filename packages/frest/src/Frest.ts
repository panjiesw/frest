// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import qs from 'query-string';
import { FrestError } from './FrestError';
import * as t from './types';
import xhr from './xhr';

interface IInternalAfterFetch {
  origin: Response;
  request: t.IRequest;
}

export const DEFAULT_CONFIG: t.IConfig & {
  interceptors: t.IInterceptorSet;
} = {
  base: '',
  fetch,
  headers: new Headers(),
  interceptors: { after: [], before: [], error: [] },
  method: 'GET',
};

class Frest implements t.IFrest {
  private _config: t.IConfig;

  constructor(config?: t.ConfigType) {
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

  public get config(): t.IConfig {
    return this._config;
  }

  public get base(): string {
    return this._config.base;
  }

  public mergeConfig(config: t.ConfigMergeType) {
    const interceptors = {
      ...this._config.interceptors,
      ...config.interceptors,
    };
    this._config = { ...this._config, ...config, interceptors };
  }

  public get fetchFn(): typeof window.fetch {
    return this._config.fetch;
  }

  public addAfterInterceptor(interceptor: t.IAfterInterceptor) {
    this._config.interceptors.after.push(interceptor);
  }

  public addBeforeInterceptor(interceptor: t.IBeforeInterceptor) {
    this._config.interceptors.before.push(interceptor);
  }

  public addErrorInterceptor(interceptor: t.IErrorInterceptor) {
    this._config.interceptors.error.push(interceptor);
  }

  public removeAfterInterceptor(idv: string | t.IAfterInterceptor) {
    this.removeInterceptor('after', idv);
  }

  public removeBeforeInterceptor(idv: string | t.IBeforeInterceptor) {
    this.removeInterceptor('before', idv);
  }

  public removeErrorInterceptor(idv: string | t.IErrorInterceptor) {
    this.removeInterceptor('error', idv);
  }

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

  public request<T = any>(
    init: t.RequestType,
    request: Partial<t.IRequest> = {},
  ): Promise<t.IResponse<T>> {
    return this.internalRequest<T>({
      ...this.requestConfig(init, request),
      action: 'request',
    });
  }

  public upload<T = any>(
    init: t.RequestType,
    request: Partial<t.IRequest> = {},
  ): Promise<t.IResponse<T>> {
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

  public download<T = any>(
    init: t.RequestType,
    request: Partial<t.IRequest> = {},
  ): Promise<t.IResponse<T>> {
    const conf = this.requestConfig(init, request);
    return this.internalRequest<T>({
      ...conf,
      method: conf.method || 'GET',
      action: 'download',
    });
  }

  private removeInterceptor(
    i: 'after' | 'before' | 'error',
    idv:
      | string
      | t.IAfterInterceptor
      | t.IBeforeInterceptor
      | t.IErrorInterceptor,
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
    request: t.IRequest,
  ): Promise<t.IResponse<T>> {
    return this.doBefore(request)
      .then(this.doRequest)
      .then(this.doAfter)
      .catch(this.onError(request));
  }

  private requestConfig(
    init: t.RequestType,
    request: Partial<t.IRequest>,
  ): t.IRequest {
    const { method } = this._config;
    if (typeof init === 'string' || init instanceof Array) {
      this.headers(request);
      return {
        method,
        path: init,
        ...request,
      } as any;
    }
    this.headers(init);
    return {
      method,
      path: '',
      ...init,
    } as any;
  }

  private headers(request: Partial<t.IRequest>) {
    if (request.headers) {
      const headers = new Headers(this._config.headers);
      for (const header of request.headers.entries()) {
        headers.set(header[0], header[1]);
      }
    } else {
      request.headers = new Headers(this._config.headers);
    }
  }

  private getFetch(request: t.IRequest): typeof fetch {
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

  private doBefore(request: t.IRequest) {
    return new Promise<t.IRequest>((resolve, reject) => {
      let requestPromise = Promise.resolve<t.IRequest>(request);
      for (const requestInterceptor of this._config.interceptors.before) {
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
            request: requestConfig,
          });
        });
      }

      requestPromise.then(resolve).catch(e => {
        const cause = typeof e === 'string' ? e : e.message ? e.message : e;
        reject(
          new FrestError(
            `Error in before request interceptor: ${cause}`,
            this._config,
            request,
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
      fetchFn = this.getFetch(request);
    } catch (error) {
      return Promise.reject(error);
    }

    const query = this.parseQuery(request.query);
    const fullPath = this.trimSlashes(
      `${this._config.base}/${paths.map(encodeURI).join('/')}${query}`,
    );
    return fetchFn(fullPath, request).then<IInternalAfterFetch>(origin => ({
      request,
      origin,
    }));
  };

  private doAfter = <T = any>(
    afterFetch: IInternalAfterFetch,
  ): Promise<t.IResponse> => {
    const { origin, request } = afterFetch;
    if (!origin.ok) {
      return Promise.reject(
        new FrestError(
          `Non OK HTTP response status: ${origin.status} - ${
            origin.statusText
          }`,
          this._config,
          request,
          { origin },
        ),
      );
    }
    let responsePromise: Promise<t.IResponse<T>> = Promise.resolve({
      origin,
    });
    for (const responseInterceptor of this._config.interceptors.after) {
      responsePromise = responsePromise.then(response => {
        if (!response) {
          throw new Error(
            `interceptor id ${responseInterceptor.id} didn't return response`,
          );
        }
        return responseInterceptor({
          config: this._config,
          request,
          response,
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
          { origin },
        ),
      );
    });
  };

  private onError = (requestConfig: t.IRequest) => (e: any): any => {
    let err: t.IFrestError = this.toFrestError(e, requestConfig);

    if (this._config.interceptors.error.length === 0) {
      return Promise.reject(err);
    }

    return new Promise<any>((resolve, reject) => {
      let promise: Promise<void | t.IResponse<any> | null> = Promise.resolve(
        null,
      );
      let recovery: t.IResponse<any> | null = null;
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
            err = this.toFrestError(ee, requestConfig);
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

  private toFrestError(e: any, requestConfig: t.IRequest): t.IFrestError {
    return !e.config && !e.request
      ? new FrestError(e.message, this._config, requestConfig)
      : e;
  }
}

const methods: { [idx: string]: t.HttpMethod } = {
  post: 'POST',
  create: 'POST',
  get: 'GET',
  read: 'GET',
  put: 'PUT',
  update: 'PUT',
  delete: 'DELETE',
  destroy: 'DELETE',
  patch: 'PATCH',
  option: 'OPTION',
};

for (const action in methods) {
  if (methods.hasOwnProperty(action)) {
    const method = methods[action];
    Object.defineProperty(Frest.prototype, action, {
      // tslint:disable-next-line:object-literal-shorthand
      value: function(
        init: t.RequestType,
        requestConfig: Partial<t.IRequest> = {},
      ) {
        return this.internalRequest({
          ...this.requestConfig(init, requestConfig),
          method,
          action,
        });
      },
    });
  }
}

interface Frest extends t.IFrest {
  post<T = any>(
    init: t.RequestType,
    requestConfig?: Partial<t.IRequest>,
  ): Promise<t.IResponse<T>>;
  create<T = any>(
    init: t.RequestType,
    requestConfig?: Partial<t.IRequest>,
  ): Promise<t.IResponse<T>>;
  get<T = any>(
    init: t.RequestType,
    requestConfig?: Partial<t.IRequest>,
  ): Promise<t.IResponse<T>>;
  read<T = any>(
    init: t.RequestType,
    requestConfig?: Partial<t.IRequest>,
  ): Promise<t.IResponse<T>>;
  put<T = any>(
    init: t.RequestType,
    requestConfig?: Partial<t.IRequest>,
  ): Promise<t.IResponse<T>>;
  update<T = any>(
    init: t.RequestType,
    requestConfig?: Partial<t.IRequest>,
  ): Promise<t.IResponse<T>>;
  patch<T = any>(
    init: t.RequestType,
    requestConfig?: Partial<t.IRequest>,
  ): Promise<t.IResponse<T>>;
  delete<T = any>(
    init: t.RequestType,
    requestConfig?: Partial<t.IRequest>,
  ): Promise<t.IResponse<T>>;
  destroy<T = any>(
    init: t.RequestType,
    requestConfig?: Partial<t.IRequest>,
  ): Promise<t.IResponse<T>>;
  option<T = any>(
    init: t.RequestType,
    requestConfig?: Partial<t.IRequest>,
  ): Promise<t.IResponse<T>>;
}

export { Frest };
