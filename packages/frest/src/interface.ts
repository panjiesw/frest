// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export type THttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTION';

export type THttpHeaders = {[key: string]: string} | Headers

export interface IFrestConfig extends RequestInit {
  base: string;
  fetch: typeof fetch;
  interceptors: {
    after?: IAfterResponseInterceptor[];
    before?: IBeforeRequestInterceptor[];
    error?: IErrorInterceptor[];
  };
  method: THttpMethod;
  headers: THttpHeaders;
}

export type TFrestConfig = string | Partial<IFrestConfig>;

export interface IFrestRequestConfig extends RequestInit {
  [key: string]: any;
  path: string | string[];
  method: THttpMethod;
  headers: THttpHeaders;
  base?: string;
  query?: any;
  fetch?: typeof fetch;
  skip?: string[];
  nowrap?: boolean;
  body?: any;
}

export type TFrestRequest = string | string[] | Partial<IFrestRequestConfig>;

export interface IWrappedFrestResponse<T = any> {
  origin: Response;
  value?: T;
}

export type TFrestResponse<T = any> = (T | null) | IWrappedFrestResponse<T>;

export interface IFrest {
  readonly base: string;
  readonly config: IFrestConfig;
  readonly fetchFn: typeof fetch;
  mergeConfig(config: Partial<IFrestConfig>): void;
  addAfterResponseInterceptor(interceptor: IAfterResponseInterceptor): void;
  addBeforeRequestInterceptor(interceptor: IBeforeRequestInterceptor): void;
  addErrorInterceptor(interceptor: IErrorInterceptor): void;
  removeAfterResponseInterceptor(
    idOrValue: string | IAfterResponseInterceptor,
  ): void;
  removeBeforeRequestInterceptor(
    idOrValue: string | IBeforeRequestInterceptor,
  ): void;
  removeErrorInterceptor(id: string | IErrorInterceptor): void;
  request<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig?: Partial<IFrestRequestConfig>,
  ): Promise<TFrestResponse<T>>;
  post<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig?: Partial<IFrestRequestConfig>,
  ): Promise<TFrestResponse<T>>;
  create<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig?: Partial<IFrestRequestConfig>,
  ): Promise<TFrestResponse<T>>;
  get<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig?: Partial<IFrestRequestConfig>,
  ): Promise<TFrestResponse<T>>;
  read<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig?: Partial<IFrestRequestConfig>,
  ): Promise<TFrestResponse<T>>;
  put<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig?: Partial<IFrestRequestConfig>,
  ): Promise<TFrestResponse<T>>;
  update<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig?: Partial<IFrestRequestConfig>,
  ): Promise<TFrestResponse<T>>;
  patch<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig?: Partial<IFrestRequestConfig>,
  ): Promise<TFrestResponse<T>>;
  delete<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig?: Partial<IFrestRequestConfig>,
  ): Promise<TFrestResponse<T>>;
  destroy<T = any>(
    pathOrConfig: TFrestRequest,
    requestConfig?: Partial<IFrestRequestConfig>,
  ): Promise<TFrestResponse<T>>;
}

export interface IFrestError {
  message: string;
  config: IFrestConfig;
  request: IFrestRequestConfig;
  response?: IWrappedFrestResponse<any>;
}

export interface IBeforeRequestInterceptorArg {
  config: IFrestConfig;
  request: IFrestRequestConfig;
}

export interface IAfterResponseInterceptorArg {
  config: IFrestConfig;
  response: IWrappedFrestResponse<any>;
}

export interface ICommonInterceptor {
  id?: string;
}

export interface IBeforeRequestInterceptor extends ICommonInterceptor {
  (input: IBeforeRequestInterceptorArg): Promise<IFrestRequestConfig>;
}

export interface IAfterResponseInterceptor extends ICommonInterceptor {
  (response: IAfterResponseInterceptorArg): Promise<IWrappedFrestResponse<any>>;
}

export interface IErrorInterceptor extends ICommonInterceptor {
  (error: IFrestError): Promise<IWrappedFrestResponse<any> | null>;
}

export interface IInterceptorSets {
  after: IAfterResponseInterceptor[]
  before: IBeforeRequestInterceptor[]
  error: IErrorInterceptor[]
}
