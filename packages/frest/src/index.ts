// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Frest } from './Frest';
import { FrestError } from './FrestError';
import * as t from './types';

const frest = new Frest();

export const mergeConfig = (config: Partial<t.IConfig>): void =>
  frest.mergeConfig.call(frest, config);

export const addAfterResponseInterceptor = (
  interceptor: t.IAfterInterceptor,
): void => frest.addAfterInterceptor.call(frest, interceptor);

export const addBeforeRequestInterceptor = (
  interceptor: t.IBeforeInterceptor,
): void => frest.addBeforeInterceptor.call(frest, interceptor);

export const addErrorInterceptor = (interceptor: t.IErrorInterceptor): void =>
  frest.addErrorInterceptor.call(frest, interceptor);

export const removeAfterResponseInterceptor = (
  idOrValue: string | t.IAfterInterceptor,
): void => frest.removeAfterInterceptor.call(frest, idOrValue);

export const removeBeforeRequestInterceptor = (
  idOrValue: string | t.IBeforeInterceptor,
): void => frest.removeBeforeInterceptor.call(frest, idOrValue);

export const removeErrorInterceptor = (
  idOrValue: string | t.IErrorInterceptor,
): void => frest.removeErrorInterceptor.call(frest, idOrValue);

export const request = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.request.call(frest, pathOrConfig, requestConfig);

export const post = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.post.call(frest, pathOrConfig, requestConfig);

export const create = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.create.call(frest, pathOrConfig, requestConfig);

export const get = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.get.call(frest, pathOrConfig, requestConfig);

export const read = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.read.call(frest, pathOrConfig, requestConfig);

export const put = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.put.call(frest, pathOrConfig, requestConfig);

export const update = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.update.call(frest, pathOrConfig, requestConfig);

export const patch = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.patch.call(frest, pathOrConfig, requestConfig);

export const del = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.delete.call(frest, pathOrConfig, requestConfig);

export const destroy = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.destroy.call(frest, pathOrConfig, requestConfig);

export const option = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.option.call(frest, pathOrConfig, requestConfig);

export const upload = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.upload.call(frest, pathOrConfig, requestConfig);

export const download = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IResponse<T>> =>
  frest.download.call(frest, pathOrConfig, requestConfig);

export const getBase = (): string => frest.base;
export const getConfig = (): t.IConfig => frest.config;
export const getFetchFn = (): typeof fetch => frest.fetchFn;

export * from './types';

export { Frest, FrestError };
