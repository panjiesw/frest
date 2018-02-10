// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import assign from 'object-assign';
import qs from 'query-string';
import { FrestError } from './FrestError';
import {
  TFrestConfig,
  TFrestRequest,
  TFrestResponse,
  IAfterResponseInterceptor,
  IBeforeRequestInterceptor,
  IErrorInterceptor,
  IFrest,
  IFrestConfig,
  IFrestError,
  IFrestRequestConfig,
  IInterceptorSets,
  IWrappedFrestResponse,
  ICommonInterceptor,
} from './interface';

interface IInternalAfterFetch {
  response: Response;
  request: IFrestRequestConfig;
}

interface IInternalTransform {
  response: IWrappedFrestResponse<any>;
  request: IFrestRequestConfig;
}

export const FREST_DEFAULT_CONFIG: IFrestConfig = {
  base: '',
  fetch,
  headers: new Headers(),
  interceptors: {},
  method: 'GET',
};

export class Frest implements IFrest {
  private _config: IFrestConfig;
  private interceptors: IInterceptorSets;

  constructor(config?: TFrestConfig) {
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

  public get config(): IFrestConfig {
    return this._config;
  }

  public get base(): string {
    return this._config.base;
  }

  public mergeConfig(config: Partial<IFrestConfig>) {
    this._config = assign({}, this._config, config);
  }

  public get fetchFn(): typeof window.fetch {
    return this._config.fetch;
  }

  public addAfterResponseInterceptor(interceptor: IAfterResponseInterceptor) {
    this.interceptors.after.push(interceptor);
  }

  public addBeforeRequestInterceptor(interceptor: IBeforeRequestInterceptor) {
    this.interceptors.before.push(interceptor);
  }

  public addErrorInterceptor(interceptor: IErrorInterceptor) {
    this.interceptors.error.push(interceptor);
  }

  public removeAfterResponseInterceptor(
    idOrValue: string | IAfterResponseInterceptor,
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
    idOrValue: string | IBeforeRequestInterceptor,
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

  public removeErrorInterceptor(idOrValue: string | IErrorInterceptor) {
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
    pathOrConfig: TFrestRequest,
    requestConfig: Partial<IFrestRequestConfig> = {},
  ): Promise<TFrestResponse<T>> {
    const config = assign<IFrestRequestConfig, Partial<IFrestRequestConfig>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'GET' },
    );
    return this.internalRequest<T>(config);
  }

  public post<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig: Partial<IFrestRequestConfig> = {},
  ): Promise<TFrestResponse<T>> {
    const config = assign<IFrestRequestConfig, Partial<IFrestRequestConfig>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'POST' },
    );
    return this.internalRequest<T>(config);
  }
  public create<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig: Partial<IFrestRequestConfig> = {},
  ): Promise<TFrestResponse<T>> {
    return this.post<T>(pathOrConfig, requestConfig);
  }

  public get<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig: Partial<IFrestRequestConfig> = {},
  ): Promise<TFrestResponse<T>> {
    const config = assign<IFrestRequestConfig, Partial<IFrestRequestConfig>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'GET' },
    );
    return this.internalRequest<T>(config);
  }
  public read<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig: Partial<IFrestRequestConfig> = {},
  ): Promise<TFrestResponse<T>> {
    return this.get<T>(pathOrConfig, requestConfig);
  }

  public put<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig: Partial<IFrestRequestConfig> = {},
  ): Promise<TFrestResponse<T>> {
    const config = assign<IFrestRequestConfig, Partial<IFrestRequestConfig>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'PUT' },
    );
    return this.internalRequest<T>(config);
  }
  public update<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig: Partial<IFrestRequestConfig> = {},
  ): Promise<TFrestResponse<T>> {
    return this.put<T>(pathOrConfig, requestConfig);
  }

  public patch<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig: Partial<IFrestRequestConfig> = {},
  ): Promise<TFrestResponse<T>> {
    const config = assign<IFrestRequestConfig, Partial<IFrestRequestConfig>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'PATCH' },
    );
    return this.internalRequest<T>(config);
  }

  public delete<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig: Partial<IFrestRequestConfig> = {},
  ): Promise<TFrestResponse<T>> {
    const config = assign<IFrestRequestConfig, Partial<IFrestRequestConfig>>(
      this.requestConfig(pathOrConfig, requestConfig),
      { method: 'DELETE' },
    );
    return this.internalRequest<T>(config);
  }
  public destroy<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig: Partial<IFrestRequestConfig> = {},
  ): Promise<TFrestResponse<T>> {
    return this.delete<T>(pathOrConfig, requestConfig);
  }

  private findInterceptor(arr: ICommonInterceptor[], id?: string): number {
    let found  = false;
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
    requestConfig: IFrestRequestConfig,
  ): Promise<TFrestResponse<T>> {
    return this.doBefore(requestConfig)
      .then(this.doRequest)
      .then(this.doAfter)
      .then(this.doTransform)
      .catch(this.onError(requestConfig));
  }

  private requestConfig(
    pathOrConfig: TFrestRequest,
    requestConfig: Partial<IFrestRequestConfig>,
  ): IFrestRequestConfig {
    if (typeof pathOrConfig === 'string' || pathOrConfig instanceof Array) {
      return assign<IFrestRequestConfig, Partial<IFrestRequestConfig>>(
        {
          headers: new Headers(),
          method: 'GET',
          path: pathOrConfig,
        },
        requestConfig,
      );
    }
    return assign<IFrestRequestConfig, Partial<IFrestRequestConfig>>(
      {
        headers: new Headers(),
        method: 'GET',
        path: '',
      },
      pathOrConfig,
    );
  }

  private doBefore(config: IFrestRequestConfig) {
    return new Promise<IFrestRequestConfig>((resolve, reject) => {
      let requestPromise = Promise.resolve<IFrestRequestConfig>(config);
      this.interceptors.before.forEach(requestInterceptor => {
        requestPromise = requestPromise.then(r =>
          requestInterceptor({ config: this._config, request: r }),
        );
      });

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

  private doRequest = (
    request: IFrestRequestConfig,
  ): Promise<IInternalAfterFetch> => {
    let fetchFn: typeof fetch;
    const paths: string[] = request.path
      ? request.path instanceof Array ? request.path : [request.path]
      : [''];

    if (typeof request.fetch === 'function') {
      fetchFn = request.fetch;
    } else if (typeof this._config.fetch === 'function') {
      fetchFn = this._config.fetch;
    } else {
      return Promise.reject(
        new FrestError('Fetch API is not available', this._config, request),
      );
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
  ): Promise<IInternalTransform> => {
    const { response, request } = afterFetch;
    if (!response.ok) {
      return Promise.reject(
        new FrestError(
          `Non OK HTTP response status: ${response.status} - ${
            response.statusText
          }`,
          this._config,
          request,
          { origin: response, value: null },
        ),
      );
    }
    let responsePromise: Promise<IWrappedFrestResponse<T>> = Promise.resolve({
      origin: response,
    });
    this.interceptors.after.forEach(responseInterceptor => {
      responsePromise = responsePromise.then(r =>
        responseInterceptor({ config: this._config, response: r }),
      );
    });
    return responsePromise.then(r => ({ request, response: r })).catch(e => {
      const cause = typeof e === 'string' ? e : e.message ? e.message : e;
      return Promise.reject(
        new FrestError(
          `Error in after response intercepor: ${cause}`,
          this._config,
          request,
          { origin: response, value: null },
        ),
      );
    });
  };

  private doTransform = <T = any>(
    transform: IInternalTransform,
  ): Promise<TFrestResponse<T>> => {
    const { response, request } = transform;
    if (request.nowrap) {
      return Promise.resolve<T>(response.value);
    }
    return Promise.resolve<TFrestResponse<T>>(response);
  };

  private onError = (requestConfig: IFrestRequestConfig) => (e: any): any => {
    let err: IFrestError = this.toFestError(e, requestConfig);

    if (this.interceptors.error.length === 0) {
      return Promise.reject(err);
    }

    return new Promise<any>((resolve, reject) => {
      let promise: Promise<void | IWrappedFrestResponse<
        any
      > | null> = Promise.resolve(null);
      let recovery: IWrappedFrestResponse<any> | null = null;
      [...this.interceptors.error].some(int => {
        if (recovery != null) {
          return true;
        }
        promise = promise
          .then(rec => {
            if (rec != null) {
              recovery = rec;
              return rec;
            }
            return int(err);
          })
          .catch(ee => {
            err = this.toFestError(ee, requestConfig);
          });
        return false;
      });
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

  private toFestError(e: any, requestConfig: IFrestRequestConfig): IFrestError {
    return !e.config && !e.request
      ? new FrestError(e.message, this._config, requestConfig)
      : e;
  }
}
