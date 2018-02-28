// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as t from './types';

export class FrestError extends Error implements t.IFrestError {
	constructor(
		message: string,
		public config: t.IConfig,
		public request: t.IRequest,
		public wrappedResponse?: t.IWrappedResponse<any>,
	) {
		super(message);
	}
}
