// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import deepAssign from 'deep-assign';
import qs from 'query-string';
import {
	FrestConfig,
	FrestRequest,
	FrestResponse,
	IAfterResponseInterceptor,
	IBeforeRequestInterceptor,
	IErrorInterceptor,
	IFrest,
	IFrestConfig,
	IFrestRequestConfig,
	IInterceptorSets,
} from './shapes';

const defaultConfig: IFrestConfig = {
	base: '',
	fetch: window.fetch,
	interceptors: {},
};

export class Frest implements IFrest {
	private config = defaultConfig;
	private interceptors: IInterceptorSets = {
		after: new Set<IAfterResponseInterceptor>(),
		before: new Set<IBeforeRequestInterceptor>(),
		error: new Set<IErrorInterceptor>(),
	};

	constructor(config?: FrestConfig) {
		if (config) {
			this.config = deepAssign(defaultConfig, config);
		}
		this.config.base = this.trimSlashes(this.config.base);
		if (this.config.interceptors.after) {
			this.interceptors.after = new Set(this.config.interceptors.after);
		}
		if (this.config.interceptors.before) {
			this.interceptors.before = new Set(this.config.interceptors.before);
		}
		if (this.config.interceptors.error) {
			this.interceptors.error = new Set(this.config.interceptors.error);
		}
	}

	public addAfterInterceptor(interceptor: IAfterResponseInterceptor) {
		this.interceptors.after.add(interceptor);
	}

	public addBeforeInterceptor(interceptor: IBeforeRequestInterceptor) {
		this.interceptors.before.add(interceptor);
	}

	public addErrorInterceptor(interceptor: IErrorInterceptor) {
		this.interceptors.error.add(interceptor);
	}

	public removeAfterInterceptor(idOrValue: string | IAfterResponseInterceptor) {
		if (typeof idOrValue === 'string') {
			this.interceptors.after = new Set(
				[...this.interceptors.after].filter((a) => a.id !== idOrValue));
		} else {
			this.interceptors.after.delete(idOrValue);
		}
	}

	public removeBeforeInterceptor(idOrValue: string | IBeforeRequestInterceptor) {
		if (typeof idOrValue === 'string') {
			this.interceptors.before = new Set(
				[...this.interceptors.before].filter((a) => a.id !== idOrValue));
		} else {
			this.interceptors.before.delete(idOrValue);
		}
	}

	public removeErrorInterceptor(idOrValue: string | IErrorInterceptor) {
		if (typeof idOrValue === 'string') {
			this.interceptors.error = new Set(
				[...this.interceptors.error].filter((a) => a.id !== idOrValue));
		} else {
			this.interceptors.error.delete(idOrValue);
		}
	}

	public request<T>(requestConfig: FrestRequest): Promise<FrestResponse<T>> {
		let config: IFrestRequestConfig;
		if (typeof requestConfig === 'string') {
			config = { path: [requestConfig] };
		} else {
			config = requestConfig;
		}

		return this.doBefore(config)
			.then(this.doRequest)
			.then(this.doAfter);
	}

	private doBefore(config: IFrestRequestConfig) {
		return new Promise<IFrestRequestConfig>((resolve, reject) => {
			let reqp = Promise.resolve<IFrestRequestConfig>(config);
			this.interceptors.before.forEach((i) => {
				reqp = reqp.then((r) => i({ config: this.config, request: r }));
			});

			reqp.then(resolve).catch(reject);
		});
	}

	private doRequest = (request: IFrestRequestConfig): Promise<Response> => {
		let fetchFn: typeof fetch;
		const paths: string[] = request.path ?
			request.path instanceof Array ? request.path : [request.path]
			: [''];

		if (typeof request.fetch === 'function') {
			fetchFn = request.fetch;
		} else if (typeof this.config.fetch === 'function') {
			fetchFn = this.config.fetch;
		} else {
			return Promise.reject(new Error('Fetch API is not available'));
		}

		let q = request.query || '';
		if (typeof q === 'object') {
			const qq = qs.stringify(q);
			q = qq.length > 0 ? `?${qq}` : '';
		} else if (q !== '') {
			q = `?${q}`;
		}

		const fullPath = this.trimSlashes(
			`${this.config.base}/${paths.map(encodeURI).join('/')}${q}`);
		return fetchFn(fullPath, request);
	}

	private doAfter = (response: Response): Promise<FrestResponse<any>> => {
		let resp = Promise.resolve<FrestResponse<any>>({ origin: response });
		this.interceptors.after.forEach((af) => {
			resp = resp.then((r) => af({ config: this.config, response: r }));
		});
		return resp;
	}

	private trimSlashes = (input: string) => input.toString().replace(/(^\/+|\/+$)/g, '');
}
