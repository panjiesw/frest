// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Frest } from './Frest';
import { FrestError } from './FrestError';
import * as t from './types';

const frest: t.IFrest = new Frest();

export const mergeConfig = (config: Partial<t.IConfig>): void =>
  frest.mergeConfig.call(frest, config);

export const addAfterResponseInterceptor = (
  interceptor: t.IAfterResponseInterceptor,
): void => frest.addAfterResponseInterceptor.call(frest, interceptor);

export const addBeforeRequestInterceptor = (
  interceptor: t.IBeforeRequestInterceptor,
): void => frest.addBeforeRequestInterceptor.call(frest, interceptor);

export const addErrorInterceptor = (interceptor: t.IErrorInterceptor): void =>
  frest.addErrorInterceptor.call(frest, interceptor);

export const removeAfterResponseInterceptor = (
  idOrValue: string | t.IAfterResponseInterceptor,
): void => frest.removeAfterResponseInterceptor.call(frest, idOrValue);

export const removeBeforeRequestInterceptor = (
  idOrValue: string | t.IBeforeRequestInterceptor,
): void => frest.removeBeforeRequestInterceptor.call(frest, idOrValue);

export const removeErrorInterceptor = (
  idOrValue: string | t.IErrorInterceptor,
): void => frest.removeErrorInterceptor.call(frest, idOrValue);

export const request = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.request.call(frest, pathOrConfig, requestConfig);

export const post = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.post.call(frest, pathOrConfig, requestConfig);

export const create = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.create.call(frest, pathOrConfig, requestConfig);

export const get = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.get.call(frest, pathOrConfig, requestConfig);

export const read = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.read.call(frest, pathOrConfig, requestConfig);

export const put = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.put.call(frest, pathOrConfig, requestConfig);

export const update = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.update.call(frest, pathOrConfig, requestConfig);

export const patch = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.patch.call(frest, pathOrConfig, requestConfig);

export const del = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.delete.call(frest, pathOrConfig, requestConfig);

export const destroy = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.destroy.call(frest, pathOrConfig, requestConfig);

export const option = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.option.call(frest, pathOrConfig, requestConfig);

export const upload = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.upload.call(frest, pathOrConfig, requestConfig);

export const download = <T = any>(
  pathOrConfig: RequestType,
  requestConfig?: Partial<t.IRequest>,
): Promise<t.IWrappedResponse<T>> =>
  frest.download.call(frest, pathOrConfig, requestConfig);

export const getBase = (): string => frest.base;
export const getConfig = (): t.IConfig => frest.config;
export const getFetchFn = (): typeof fetch => frest.fetchFn;

export * from './types';

export { Frest, FrestError };
