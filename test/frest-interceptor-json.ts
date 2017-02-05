// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import fetchMock from 'fetch-mock';
import { Frest } from 'frest';
import { IFrest, IFrestError } from 'frest/shapes';
import * as frestJson from 'frest-interceptor-json';

function isRequestInit(req: Request | RequestInit): req is RequestInit {
	return (req as RequestInit) !== undefined;
}

describe('Frest Interceptors: JSON', () => {
	afterEach(fetchMock.restore);

	describe('Basic Functionality', () => {
		it('Must be able to add/remove', () => {
			const before = frestJson.before();
			const after = frestJson.after();
			const error = frestJson.error();

			const frest = new Frest();
			frest.addBeforeRequestInterceptor(before);
			expect((frest as any).interceptors.before.size).toBe(1);
			frest.addAfterResponseInterceptor(after);
			expect((frest as any).interceptors.after.size).toBe(1);
			frest.addErrorInterceptor(error);
			expect((frest as any).interceptors.error.size).toBe(1);

			frest.removeBeforeRequestInterceptor(before);
			expect((frest as any).interceptors.before.size).toBe(0);
			frest.removeAfterResponseInterceptor(frestJson.ID_AFTER);
			expect((frest as any).interceptors.after.size).toBe(0);
			frest.removeErrorInterceptor(error);
			expect((frest as any).interceptors.error.size).toBe(0);
		});
	});

	describe('Before', () => {
		let frest: IFrest;

		beforeEach(() => {
			fetchMock.mock('test', { status: 200 }, { name: 'test', method: 'POST' });
			frest = new Frest();
			frest.addBeforeRequestInterceptor(frestJson.before());
		});

		it('Must transform request', (done) => {
			const h = new Headers();
			h.append('some-x', 'x');
			frest.post<any>('test', { body: { foo: 'bar' }, headers: h })
				.then((_) => {
					const opt = fetchMock.lastOptions('test');
					if (isRequestInit(opt)) {
						const headers: Headers = opt.headers as Headers;
						expect(opt.body).toBe('{"foo":"bar"}');
						expect(headers.has('some-x')).toBe(true);
						expect(headers.get('content-type')).toContain('application/json');
						expect(headers.get('accept')).toContain('application/json');
						done();
					} else {
						done.fail('Invalid state');
					}
				})
				.catch(done.fail);
		});

		it('Must not transform when body is not plain object', (done) => {
			const form = new FormData();
			form.append('foo', 'bar');
			frest.post<any>('test', { body: form })
				.then((_) => {
					const opt = fetchMock.lastOptions('test');
					if (isRequestInit(opt)) {
						expect(opt.body).not.toBe('{"foo":"bar"}');
						done();
					} else {
						done.fail('Invalid state');
					}
				})
				.catch(done.fail);
		});

		it('Must not transform when skipped', (done) => {
			const form = new FormData();
			form.append('foo', 'bar');
			frest.post<any>('test', { body: { foo: 'bar' }, skip: [frestJson.ID_BEFORE] })
				.then((_) => {
					const opt = fetchMock.lastOptions('test');
					if (isRequestInit(opt)) {
						const headers: Headers = opt.headers as Headers;
						expect(opt.body).not.toBe('{"foo":"bar"}');
						expect(headers.get('content-type')).not.toContain('application/json');
						done();
					} else {
						done.fail('Invalid state');
					}
				})
				.catch(done.fail);
		});
	});

	describe('After', () => {
		let frest: IFrest;

		beforeEach(() => {
			const headers = new Headers();
			headers.append('Content-Type', 'application/json');
			fetchMock
				.mock('test', { status: 200, body: '{"foo":"bar"}', headers }, { name: 'test', method: 'GET' })
				.mock('test2', { status: 201, headers }, { name: 'test2', method: 'GET' })
				.mock('test3', { status: 200, body: '{"foo":"bar"}' }, { name: 'test3', method: 'GET' });
			frest = new Frest();
			frest.addAfterResponseInterceptor(frestJson.after());
		});

		it('Must transform response', (done) => {
			frest.get<any>('test')
				.then((res) => {
					expect(res.value).toBeTruthy();
					expect(res.value.foo).toBe('bar');
					done();
				})
				.catch(done.fail);
		});

		it('Must handle empty responses', (done) => {
			frest.get<any>('test2')
				.then((res) => {
					expect(res.value).toBeFalsy();
					expect(res.origin.status).toBe(201);
					done();
				})
				.catch(done.fail);
		});

		it('Must not transform non json responses', (done) => {
			frest.get<any>('test3')
				.then((res) => {
					expect(res.value).toBeFalsy();
					expect(res.origin.status).toBe(200);
					expect(res.origin.headers.has('content-type')).toBe(true);
					done();
				})
				.catch(done.fail);
		});
	});

	describe('Error', () => {
		let frest: IFrest;

		beforeEach(() => {
			const headers = new Headers();
			headers.append('Content-Type', 'application/json');
			fetchMock
				.mock('test', { status: 401, body: '{"foo":"bar"}', headers }, { name: 'test', method: 'GET' })
				.mock('test3', { status: 404, body: '{"foo":"bar"}' }, { name: 'test3', method: 'GET' });
			frest = new Frest();
			frest.addErrorInterceptor(frestJson.error());
		});

		it('Must transform error response', (done) => {
			frest.get<any>('test')
				.then((_) => done.fail('Unexpected successful response'))
				.catch((err) => {
					const e: IFrestError = err;
					const {response} = e;
					if (response) {
						expect(response.origin.status).toBe(401);
						expect(response.value).toBeTruthy();
						expect(response.value.foo).toBe('bar');
						done();
						return;
					}
					done.fail('Unexpected response');
				});
		});

		it('Must not transform non json error responses', (done) => {
			frest.get<any>('test3')
				.then((_) => done.fail('Unexpected successful response'))
				.catch((err) => {
					const e: IFrestError = err;
					const {response} = e;
					if (response) {
						expect(response.origin.status).toBe(404);
						expect(response.value).toBeFalsy();
						done();
						return;
					}
					done.fail('Unexpected response');
				});
		});
	});
});
