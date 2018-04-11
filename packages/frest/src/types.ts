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

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTION';

export interface IConfigBase extends RequestInit {
  base: string;
  fetch: typeof fetch;
  method: HttpMethod;
  headers: Headers;
}

export interface IConfigInterceptor {
  interceptors: IInterceptorSet;
}

export interface IConfig extends IConfigBase, IConfigInterceptor {}

export type ConfigMergeType = Partial<IConfigBase> & {
  interceptors?: Partial<IInterceptorSet>;
};

export type ConfigType = string | ConfigMergeType;

export interface IRequest extends RequestInit {
  [key: string]: any;
  path: string | string[];
  method: HttpMethod;
  headers: Headers;
  action?: string;
  base?: string;
  query?: any;
  fetch?: typeof fetch;
  skip?: string[];
  body?: any;
  onUploadProgress?: (ev: ProgressEvent) => any;
  onDownloadProgress?: (ev: ProgressEvent) => any;
}

export type RequestType = string | string[] | Partial<IRequest>;

export interface IResponse<T = any> {
  origin: Response;
  body?: T;
}

export interface IFrest {
  readonly base: string;
  readonly config: IConfig;
  readonly fetchFn: typeof fetch;
  mergeConfig(config: Partial<IConfig>): void;
  addAfterInterceptor(interceptor: IAfterInterceptor): void;
  addBeforeInterceptor(interceptor: IBeforeInterceptor): void;
  addErrorInterceptor(interceptor: IErrorInterceptor): void;
  removeAfterInterceptor(idv: string | IAfterInterceptor): void;
  removeBeforeInterceptor(idv: string | IBeforeInterceptor): void;
  removeErrorInterceptor(idv: string | IErrorInterceptor): void;
  hasInterceptor(id: string): boolean;
  parsePath(path: string | string[], query?: any): string;
  parseQuery(query: any): string;
  request<T = any>(
    pathOrConfig: RequestType,
    requestConfig?: Partial<IRequest>,
  ): Promise<IResponse<T>>;
  upload<T = any>(
    pathOrConfig: RequestType,
    requestConfig?: Partial<IRequest>,
  ): Promise<IResponse<T>>;
  download<T = any>(
    pathOrConfig: RequestType,
    requestConfig?: Partial<IRequest>,
  ): Promise<IResponse<T>>;
}

export interface IFrestError {
  message: string;
  frest: IFrest;
  request: IRequest;
  response?: IResponse;
}

export interface IBeforeInterceptorArg {
  frest: IFrest;
  request: IRequest;
}

export interface IAfterInterceptorArg {
  frest: IFrest;
  request: IRequest;
  response: IResponse;
}

export interface ICommonInterceptor {
  id?: string;
}

export interface IBeforeInterceptor extends ICommonInterceptor {
  (input: IBeforeInterceptorArg): Promise<IRequest>;
}

export interface IAfterInterceptor extends ICommonInterceptor {
  (input: IAfterInterceptorArg): Promise<IResponse>;
}

export interface IErrorInterceptor extends ICommonInterceptor {
  (error: IFrestError): Promise<IResponse | undefined | null>;
}

export interface IInterceptorSet {
  after: IAfterInterceptor[];
  before: IBeforeInterceptor[];
  error: IErrorInterceptor[];
}
