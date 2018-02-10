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

export default frest;

export {
  frest,
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
