// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Frest } from './Frest';
import { FrestError } from './FrestError';
import {
	AfterResponseInterceptorArg,
	BeforeRequestInterceptorArg,
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
	WrappedFrestResponse,
} from './shapes';

const frest: IFrest = new Frest();

export default frest;

export {
	frest,
	Frest,
	FrestError,
	FrestResponse,
	WrappedFrestResponse,
	IFrest,
	IFrestRequestConfig,
	AfterResponseInterceptorArg,
	BeforeRequestInterceptorArg,
	FrestConfig,
	FrestRequest,
	IAfterResponseInterceptor,
	IBeforeRequestInterceptor,
	ICommonInterceptor,
	IErrorInterceptor,
	IFrestConfig,
	IFrestError,
	IInterceptorSets,
}
