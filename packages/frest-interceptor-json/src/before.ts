// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
	BeforeRequestInterceptorArg,
	IBeforeRequestInterceptor,
	IFrestRequestConfig,
} from 'frest';
import assign from 'object-assign';
import { ID_BEFORE } from './ids';

const before: () => IBeforeRequestInterceptor = () => {
	const interceptor: IBeforeRequestInterceptor = (input: BeforeRequestInterceptorArg) =>
		new Promise<IFrestRequestConfig>((resolve, reject) => {
			try {
				const headers = input.request.headers ?
					new Headers(input.request.headers) : new Headers();
				const {body: origin, skip} = input.request;
				let body = input.request.body;
				if (typeof origin === 'object' &&
					!(origin instanceof FormData) &&
					!(origin instanceof ArrayBuffer) &&
					(!skip || skip.indexOf(ID_BEFORE) < 0)) {
					body = JSON.stringify(origin);
					headers.set('Content-Type', 'application/json');
					headers.set('Accept', 'application/json');
				}
				resolve(assign({}, input.request, { headers, body }));
			} catch (e) {
				reject(e);
			}
		});

	Object.defineProperty(interceptor, 'id', { value: ID_BEFORE });
	return interceptor;
};

export { before };
