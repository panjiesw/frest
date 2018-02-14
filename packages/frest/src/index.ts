// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Frest } from './Frest';
import { FrestError } from './FrestError';
import {
  IAfterResponseInterceptorArg,
  IBeforeRequestInterceptorArg,
  TFrestConfig,
  TFrestRequest,
  TFrestResponse,
  IAfterResponseInterceptor,
  IBeforeRequestInterceptor,
  ICommonInterceptor,
  IErrorInterceptor,
  IFrest,
  IFrestConfig,
  IFrestError,
  IFrestRequestConfig,
  IInterceptorSets,
  IWrappedFrestResponse,
} from './interface';

const frest: IFrest = new Frest();

export const isWrapped = <T = any>(
  res: TFrestResponse<T>,
): res is IWrappedFrestResponse<T> => frest.isWrapped.call(frest, res);

export const mergeConfig = (config: Partial<IFrestConfig>): void =>
  frest.mergeConfig.call(frest, config);

export const addAfterResponseInterceptor = (
  interceptor: IAfterResponseInterceptor,
): void => frest.addAfterResponseInterceptor.call(frest, interceptor);

export const addBeforeRequestInterceptor = (
  interceptor: IBeforeRequestInterceptor,
): void => frest.addBeforeRequestInterceptor.call(frest, interceptor);

export const addErrorInterceptor = (interceptor: IErrorInterceptor): void =>
  frest.addErrorInterceptor.call(frest, interceptor);

export const removeAfterResponseInterceptor = (
  idOrValue: string | IAfterResponseInterceptor,
): void => frest.removeAfterResponseInterceptor.call(frest, idOrValue);

export const removeBeforeRequestInterceptor = (
  idOrValue: string | IBeforeRequestInterceptor,
): void => frest.removeBeforeRequestInterceptor.call(frest, idOrValue);

export const removeErrorInterceptor = (
  idOrValue: string | IErrorInterceptor,
): void => frest.removeErrorInterceptor.call(frest, idOrValue);

export const request = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.request.call(frest, pathOrConfig, requestConfig);

export const post = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.post.call(frest, pathOrConfig, requestConfig);

export const create = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.create.call(frest, pathOrConfig, requestConfig);

export const get = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.get.call(frest, pathOrConfig, requestConfig);

export const read = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.read.call(frest, pathOrConfig, requestConfig);

export const put = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.put.call(frest, pathOrConfig, requestConfig);

export const update = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.update.call(frest, pathOrConfig, requestConfig);

export const patch = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.patch.call(frest, pathOrConfig, requestConfig);

export const del = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.delete.call(frest, pathOrConfig, requestConfig);

export const destroy = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.destroy.call(frest, pathOrConfig, requestConfig);

export const option = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.option.call(frest, pathOrConfig, requestConfig);

export const upload = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.upload.call(frest, pathOrConfig, requestConfig);

export const download = <T = any>(
  pathOrConfig: TFrestRequest,
  requestConfig?: Partial<IFrestRequestConfig>,
): Promise<TFrestResponse<T>> =>
  frest.download.call(frest, pathOrConfig, requestConfig);

export const getBase = (): string => frest.base;
export const getConfig = (): IFrestConfig => frest.config;
export const getFetchFn = (): typeof fetch => frest.fetchFn;

export {
  Frest,
  FrestError,
  TFrestResponse,
  IWrappedFrestResponse,
  IFrest,
  IFrestRequestConfig,
  IAfterResponseInterceptorArg,
  IBeforeRequestInterceptorArg,
  TFrestConfig,
  TFrestRequest,
  IAfterResponseInterceptor,
  IBeforeRequestInterceptor,
  ICommonInterceptor,
  IErrorInterceptor,
  IFrestConfig,
  IFrestError,
  IInterceptorSets,
};
