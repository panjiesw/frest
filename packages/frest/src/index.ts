// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Frest } from './Frest';
import { FrestError } from './FrestError';
import {
  IAfterResponseInterceptorArg,
  IBeforeRequestInterceptorArg,
  FrestConfig,
  FrestRequest,
  FrestResponse,
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
} from './shapes';

const frest: IFrest = new Frest();

export default frest;

export {
  frest,
  Frest,
  FrestError,
  FrestResponse,
  IWrappedFrestResponse,
  IFrest,
  IFrestRequestConfig,
  IAfterResponseInterceptorArg,
  IBeforeRequestInterceptorArg,
  FrestConfig,
  FrestRequest,
  IAfterResponseInterceptor,
  IBeforeRequestInterceptor,
  ICommonInterceptor,
  IErrorInterceptor,
  IFrestConfig,
  IFrestError,
  IInterceptorSets,
};
