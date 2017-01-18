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
}

export type FrestRequest = string | IFrestRequestConfig;

export type FrestResponse<T> = {
	origin: Response;
	value?: T;
};

export interface IFrest {
	addAfterResponseInterceptor(interceptor: IAfterResponseInterceptor): void;
	addBeforeRequestInterceptor(interceptor: IBeforeRequestInterceptor): void;
	addErrorInterceptor(interceptor: IErrorInterceptor): void;
	removeAfterResponseInterceptor(idOrValue: string | IAfterResponseInterceptor): void;
	removeBeforeRequestInterceptor(idOrValue: string | IBeforeRequestInterceptor): void;
	removeErrorInterceptor(id: string | IErrorInterceptor): void;
	request<T>(request: FrestRequest): Promise<FrestResponse<T>>;
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

export type BeforeRequestInterceptorArg = {
	config: IFrestConfig;
	request: IFrestRequestConfig;
};

export type AfterResponseInterceptorArg = {
	config: IFrestConfig;
	response: FrestResponse<any>
};

export interface ICommonInterceptor {
	id?: string;
}

export interface IBeforeRequestInterceptor extends ICommonInterceptor {
	(input: BeforeRequestInterceptorArg): Promise<IFrestRequestConfig>;
}

export interface IAfterResponseInterceptor extends ICommonInterceptor {
	(response: AfterResponseInterceptorArg): Promise<FrestResponse<any>>;
}

export interface IErrorInterceptor extends ICommonInterceptor {
	(): Promise<FrestResponse<any> | null>;
}

export interface IInterceptorSets {
	after: Set<IAfterResponseInterceptor>;
	before: Set<IBeforeRequestInterceptor>;
	error: Set<IErrorInterceptor>;
}
