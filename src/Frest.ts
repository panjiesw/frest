// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import deepAssign from 'deep-assign';
import assign from 'object-assign';
import qs from 'query-string';
import { FrestError } from './FrestError';
import {
	FrestConfig,
	FrestRequest,
	FrestResponse,
	IAfterResponseInterceptor,
	IBeforeRequestInterceptor,
	IErrorInterceptor,
	IFrest,
	IFrestConfig,
	IFrestError,
	IFrestRequestConfig,
	IInterceptorSets,
} from './shapes';

interface IIntAfterFetch {
	response: Response;
	request: IFrestRequestConfig;
}

const defaultConfig: IFrestConfig = {
	base: '',
	fetch: window.fetch,
	interceptors: {},
};

export class Frest implements IFrest {
	public config = defaultConfig;
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

	public set base(base: string) {
		this.config.base = base;
	}

	public get base(): string {
		return this.config.base;
	}

	public set fetchFn(fetchFn: typeof window.fetch) {
		this.config.fetch = fetchFn;
	}

	public get fetchFn(): typeof window.fetch {
		return this.config.fetch;
	}

	public addAfterResponseInterceptor(interceptor: IAfterResponseInterceptor) {
		this.interceptors.after.add(interceptor);
	}

	public addBeforeRequestInterceptor(interceptor: IBeforeRequestInterceptor) {
		this.interceptors.before.add(interceptor);
	}

	public addErrorInterceptor(interceptor: IErrorInterceptor) {
		this.interceptors.error.add(interceptor);
	}

	public removeAfterResponseInterceptor(idOrValue: string | IAfterResponseInterceptor) {
		if (typeof idOrValue === 'string') {
			this.interceptors.after = new Set(
				[...this.interceptors.after].filter((a) => a.id !== idOrValue));
		} else {
			this.interceptors.after.delete(idOrValue);
		}
	}

	public removeBeforeRequestInterceptor(idOrValue: string | IBeforeRequestInterceptor) {
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

	public request<T>(config: IFrestRequestConfig): Promise<FrestResponse<T>> {
		return this.doBefore(config)
			.then(this.doRequest)
			.then(this.doAfter)
			.catch(this.onError);
	}

	public post<T>(pathOrConfig: FrestRequest, requestConfig: IFrestRequestConfig = {}): Promise<FrestResponse<T>> {
		const config = assign<IFrestRequestConfig, IFrestRequestConfig>(
			this.requestConfig(pathOrConfig, requestConfig), { method: 'POST' });
		return this.request<T>(config);
	}
	public create<T>(pathOrConfig: FrestRequest, requestConfig: IFrestRequestConfig = {}): Promise<FrestResponse<T>> {
		return this.post<T>(pathOrConfig, requestConfig);
	}

	public get<T>(pathOrConfig: FrestRequest, requestConfig: IFrestRequestConfig = {}): Promise<FrestResponse<T>> {
		const config = assign<IFrestRequestConfig, IFrestRequestConfig>(
			this.requestConfig(pathOrConfig, requestConfig), { method: 'GET' });
		return this.request<T>(config);
	}
	public read<T>(pathOrConfig: FrestRequest, requestConfig: IFrestRequestConfig = {}): Promise<FrestResponse<T>> {
		return this.get<T>(pathOrConfig, requestConfig);
	}

	public put<T>(pathOrConfig: FrestRequest, requestConfig: IFrestRequestConfig = {}): Promise<FrestResponse<T>> {
		const config = assign<IFrestRequestConfig, IFrestRequestConfig>(
			this.requestConfig(pathOrConfig, requestConfig), { method: 'PUT' });
		return this.request<T>(config);
	}
	public update<T>(pathOrConfig: FrestRequest, requestConfig: IFrestRequestConfig = {}): Promise<FrestResponse<T>> {
		return this.put<T>(pathOrConfig, requestConfig);
	}

	public patch<T>(pathOrConfig: FrestRequest, requestConfig: IFrestRequestConfig = {}): Promise<FrestResponse<T>> {
		const config = assign<IFrestRequestConfig, IFrestRequestConfig>(
			this.requestConfig(pathOrConfig, requestConfig), { method: 'PATCH' });
		return this.request<T>(config);
	}

	public delete<T>(pathOrConfig: FrestRequest, requestConfig: IFrestRequestConfig = {}): Promise<FrestResponse<T>> {
		const config = assign<IFrestRequestConfig, IFrestRequestConfig>(
			this.requestConfig(pathOrConfig, requestConfig), { method: 'DELETE' });
		return this.request<T>(config);
	}
	public destroy<T>(pathOrConfig: FrestRequest, requestConfig: IFrestRequestConfig = {}): Promise<FrestResponse<T>> {
		return this.delete<T>(pathOrConfig, requestConfig);
	}

	private requestConfig(pathOrConfig: FrestRequest, requestConfig: IFrestRequestConfig): IFrestRequestConfig {
		if (typeof pathOrConfig === 'string' || pathOrConfig instanceof Array) {
			return assign<IFrestRequestConfig, IFrestRequestConfig>(requestConfig, { path: pathOrConfig });
		}
		return pathOrConfig;
	}

	private doBefore(config: IFrestRequestConfig) {
		return new Promise<IFrestRequestConfig>((resolve, reject) => {
			let reqp = Promise.resolve<IFrestRequestConfig>(config);
			this.interceptors.before.forEach((i) => {
				reqp = reqp.then((r) => i({ config: this.config, request: r }));
			});

			reqp.then(resolve).catch((e) => {
				const cause = typeof e === 'string' ? e : e.message ? e.message : e;
				reject(new FrestError(
					`Error in before request interceptor: ${cause}`,
					this.config,
					config));
			});
		});
	}

	private doRequest = (request: IFrestRequestConfig): Promise<IIntAfterFetch> => {
		let fetchFn: typeof fetch;
		const paths: string[] = request.path ?
			request.path instanceof Array ? request.path : [request.path]
			: [''];

		if (typeof request.fetch === 'function') {
			fetchFn = request.fetch;
		} else if (typeof this.config.fetch === 'function') {
			fetchFn = this.config.fetch;
		} else {
			return Promise.reject(
				new FrestError(
					'Fetch API is not available',
					this.config,
					request));
		}

		const query = this.parseQuery(request.query);
		const fullPath = this.trimSlashes(
			`${this.config.base}/${paths.map(encodeURI).join('/')}${query}`);
		return fetchFn(fullPath, request)
			.then<IIntAfterFetch>((response) => ({ response, request }));
	}

	private doAfter = (afterFetch: IIntAfterFetch): Promise<FrestResponse<any>> => {
		const {response, request} = afterFetch;
		if (!response.ok) {
			return Promise.reject(new FrestError(
				`Non OK HTTP response status: ${response.status} - ${response.statusText}`,
				this.config,
				request,
				{ origin: response, value: null }));
		}
		let resp = Promise.resolve<FrestResponse<any>>({ origin: response });
		this.interceptors.after.forEach((af) => {
			resp = resp.then((r) => af({ config: this.config, response: r }));
		});
		return resp.catch((e) => {
			const cause = typeof e === 'string' ? e : e.message ? e.message : e;
			return Promise.reject(new FrestError(
				`Error in after response intercepor: ${cause}`,
				this.config,
				request,
				{ origin: response, value: null }));
		});
	}

	private onError = (e: any): any => {
		let err: IFrestError = e;
		if (!e.config && !e.request) {
			err = new FrestError(e.message, this.config, {});
		}

		if (this.interceptors.error.size === 0) {
			return Promise.reject(err);
		}

		let recp: Promise<FrestResponse<any> | null> = Promise.resolve(null);
		let recovery: FrestResponse<any> | null = null;
		[...this.interceptors.error].some((int) => {
			if (recovery != null) {
				return true;
			}
			recp = recp.then((rec) => {
				if (rec != null) {
					recovery = rec;
					return rec;
				}
				return int(err);
			}).catch((ee) => err = ee);
			return false;
		});

		if (recovery) {
			return Promise.resolve(recovery);
		}
		return Promise.reject(err);
	}

	private parseQuery(query: any): string {
		let q = query || '';
		if (typeof q === 'object') {
			const qq = qs.stringify(q);
			q = qq.length > 0 ? `?${qq}` : '';
		} else if (q !== '') {
			q = `?${q}`;
		}

		return q;
	}

	private trimSlashes(input: string): string {
		return input.toString().replace(/(^\/+|\/+$)/g, '');
	}
}
