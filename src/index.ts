// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import assign from 'object-assign';
import { Frest } from './Frest';
import {
	FrestResponse,
	IFrest,
	IFrestRequestConfig,
} from './shapes';

const defaultFrest: IFrest = new Frest();

const get = <T>(path: string, requestConfig: IFrestRequestConfig = {}): Promise<FrestResponse<T>> => {
	const config = assign(requestConfig, {paths: path, method: 'GET'});
	return defaultFrest.request<T>(config);
};

export default {
	get,
};

export {
	Frest,
	FrestResponse,
	IFrest,
	IFrestRequestConfig,
}
