// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export interface IFrestConfig {
	base: string;
	fetch: typeof window.fetch;
	interceptors: {
		after?: IAfterResponseInterceptor[];
		before?: IBeforeRequestInterceptor[];
		error?: IErrorInterceptor[];
	};
}

export type FrestConfig = Partial<IFrestConfig>;

export interface IFrestRequestConfig extends RequestInit {
	path?: string | string[];
	query?: any;
	fetch?: typeof window.fetch;
	skip?: string[];
	nowrap?: boolean;
	body?: any;
}

export type FrestRequest = string | string[] | IFrestRequestConfig;

export interface IWrappedFrestResponse<T> {
	origin: Response;
	value?: T;
}

export type FrestResponse<T> = (T | null) | IWrappedFrestResponse<T>;

export interface IFrest {
	config: IFrestConfig;
	base: string;
	fetchFn: typeof window.fetch;
	addAfterResponseInterceptor(interceptor: IAfterResponseInterceptor): void;
	addBeforeRequestInterceptor(interceptor: IBeforeRequestInterceptor): void;
	addErrorInterceptor(interceptor: IErrorInterceptor): void;
	removeAfterResponseInterceptor(idOrValue: string | IAfterResponseInterceptor): void;
	removeBeforeRequestInterceptor(idOrValue: string | IBeforeRequestInterceptor): void;
	removeErrorInterceptor(id: string | IErrorInterceptor): void;
	request<T>(request: IFrestRequestConfig): Promise<FrestResponse<T>>;
	post<T>(pathOrConfig: FrestRequest, requestConfig?: IFrestRequestConfig): Promise<FrestResponse<T>>;
	create<T>(pathOrConfig: FrestRequest, requestConfig?: IFrestRequestConfig): Promise<FrestResponse<T>>;
	get<T>(pathOrConfig: FrestRequest, requestConfig?: IFrestRequestConfig): Promise<FrestResponse<T>>;
	read<T>(pathOrConfig: FrestRequest, requestConfig?: IFrestRequestConfig): Promise<FrestResponse<T>>;
	put<T>(pathOrConfig: FrestRequest, requestConfig?: IFrestRequestConfig): Promise<FrestResponse<T>>;
	update<T>(pathOrConfig: FrestRequest, requestConfig?: IFrestRequestConfig): Promise<FrestResponse<T>>;
	patch<T>(pathOrConfig: FrestRequest, requestConfig?: IFrestRequestConfig): Promise<FrestResponse<T>>;
	delete<T>(pathOrConfig: FrestRequest, requestConfig?: IFrestRequestConfig): Promise<FrestResponse<T>>;
	destroy<T>(pathOrConfig: FrestRequest, requestConfig?: IFrestRequestConfig): Promise<FrestResponse<T>>;
}

export type FrestDefaultFn = <T>(request: IFrestRequestConfig) => Promise<FrestResponse<T>>;

export interface IFrestError {
	message: string;
	config: IFrestConfig;
	request: IFrestRequestConfig;
	response?: IWrappedFrestResponse<any>;
}

export interface IBeforeRequestInterceptorArg {
	config: IFrestConfig;
	request: IFrestRequestConfig;
}

export interface IAfterResponseInterceptorArg {
	config: IFrestConfig;
	response: IWrappedFrestResponse<any>;
}

export interface ICommonInterceptor {
	id?: string;
}

export interface IBeforeRequestInterceptor extends ICommonInterceptor {
	(input: IBeforeRequestInterceptorArg): Promise<IFrestRequestConfig>;
}

export interface IAfterResponseInterceptor extends ICommonInterceptor {
	(response: IAfterResponseInterceptorArg): Promise<IWrappedFrestResponse<any>>;
}

export interface IErrorInterceptor extends ICommonInterceptor {
	(error: IFrestError): Promise<IWrappedFrestResponse<any> | null>;
}

export interface IInterceptorSets {
	after: Set<IAfterResponseInterceptor>;
	before: Set<IBeforeRequestInterceptor>;
	error: Set<IErrorInterceptor>;
}
