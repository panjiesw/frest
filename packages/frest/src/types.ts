/**
 * Copyright (c) 2018 Panjie Setiawan Wicaksono
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTION';

export interface IConfig extends RequestInit {
	base: string;
	fetch: typeof fetch;
	interceptors: {
		after?: IAfterResponseInterceptor[];
		before?: IBeforeRequestInterceptor[];
		error?: IErrorInterceptor[];
	};
	method: HttpMethod;
	headers: Headers;
}

export type ConfigType = string | Partial<IConfig>;

export interface IRequest extends RequestInit {
	[key: string]: any;
	path: string | string[];
	method: HttpMethod;
	headers: Headers;
	action?: string;
	base?: string;
	query?: any;
	fetch?: typeof fetch;
	skip?: string[];
	nowrap?: boolean;
	body?: any;
	onUploadProgress?: (ev: ProgressEvent) => any;
	onDownloadProgress?: (ev: ProgressEvent) => any;
}

export type RequestType = string | string[] | Partial<IRequest>;

export interface IWrappedResponse<T = any> {
	origin: Response;
	value?: T;
}

export interface IFrest {
	readonly base: string;
	readonly config: IConfig;
	readonly fetchFn: typeof fetch;
	mergeConfig(config: Partial<IConfig>): void;
	addAfterResponseInterceptor(interceptor: IAfterResponseInterceptor): void;
	addBeforeRequestInterceptor(interceptor: IBeforeRequestInterceptor): void;
	addErrorInterceptor(interceptor: IErrorInterceptor): void;
	removeAfterResponseInterceptor(
		idOrValue: string | IAfterResponseInterceptor,
	): void;
	removeBeforeRequestInterceptor(
		idOrValue: string | IBeforeRequestInterceptor,
	): void;
	removeErrorInterceptor(idOrValue: string | IErrorInterceptor): void;
	request<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	post<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	create<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	get<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	read<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	put<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	update<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	patch<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	delete<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	destroy<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	option<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	upload<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
	download<T = any>(
		pathOrConfig: RequestType,
		requestConfig?: Partial<IRequest>,
	): Promise<IWrappedResponse<T>>;
}

export interface IFrestError {
	message: string;
	config: IConfig;
	request: IRequest;
	wrappedResponse?: IWrappedResponse<any>;
}

export interface IBeforeRequestInterceptorArg {
	config: IConfig;
	requestConfig: IRequest;
}

export interface IAfterResponseInterceptorArg {
	config: IConfig;
	wrappedResponse: IWrappedResponse<any>;
}

export interface ICommonInterceptor {
	id?: string;
}

export interface IBeforeRequestInterceptor extends ICommonInterceptor {
	(input: IBeforeRequestInterceptorArg): Promise<IRequest>;
}

export interface IAfterResponseInterceptor extends ICommonInterceptor {
	(response: IAfterResponseInterceptorArg): Promise<IWrappedResponse<any>>;
}

export interface IErrorInterceptor extends ICommonInterceptor {
	(error: IFrestError): Promise<IWrappedResponse<any> | null>;
}

export interface IInterceptorSets {
	after: IAfterResponseInterceptor[];
	before: IBeforeRequestInterceptor[];
	error: IErrorInterceptor[];
}
