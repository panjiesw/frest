// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import fetchMock from 'fetch-mock';
import { Frest } from 'frest/Frest';
import {
	AfterResponseInterceptorArg,
	FrestResponse,
	IFrestError,
	WrappedFrestResponse,
} from 'frest/shapes';

function isWrapped<T>(res: FrestResponse<T>): res is WrappedFrestResponse<T> {
	return (res as WrappedFrestResponse<T>).origin !== undefined;
}

describe('Frest', () => {

	describe('Basic Functionality', () => {
		it('Must use default config', () => {
			const frest = new Frest();
			expect(frest.config).toEqual({ base: '', fetch, interceptors: {} });
		});

		it('Must use provided config', () => {
			const after = jasmine.createSpy('after');
			const before = jasmine.createSpy('before');
			const error = jasmine.createSpy('error');
			const config = {
				base: '//test',
				interceptors: {
					after: [after],
					before: [before],
					error: [error],
				},
			};
			const frest = new Frest(config);
			expect(frest.config.base).toEqual('test');
			expect((frest as any).interceptors.after.size).toBe(1);
			expect((frest as any).interceptors.before.size).toBe(1);
			expect((frest as any).interceptors.after.size).toBe(1);
			expect((frest as any).interceptors.after.has(after)).toBe(true);
			expect((frest as any).interceptors.before.has(before)).toBe(true);
			expect((frest as any).interceptors.error.has(error)).toBe(true);
		});

		it('Must add/remove interceptors', () => {
			const after = jasmine.createSpy('after1');
			const before = jasmine.createSpy('before1');
			const error = jasmine.createSpy('error1');
			const after2: any = jasmine.createSpy('after2');
			after2.id = 'after2';
			const before2: any = jasmine.createSpy('before2');
			before2.id = 'before2';
			const error2: any = jasmine.createSpy('error2');
			error2.id = 'error2';
			const config = {
				interceptors: {
					after: [after, after2],
					before: [before, before2],
					error: [error, error2],
				},
			};
			const frest = new Frest(config);
			frest.addAfterResponseInterceptor(jasmine.createSpy('after3'));
			frest.addBeforeRequestInterceptor(jasmine.createSpy('before3'));
			frest.addErrorInterceptor(jasmine.createSpy('error3'));
			expect((frest as any).interceptors.after.size).toBe(3);
			expect((frest as any).interceptors.before.size).toBe(3);
			expect((frest as any).interceptors.error.size).toBe(3);
			frest.removeAfterResponseInterceptor(after);
			frest.removeBeforeRequestInterceptor(before);
			frest.removeErrorInterceptor(error);
			frest.removeAfterResponseInterceptor(after2.id);
			frest.removeBeforeRequestInterceptor(before2.id);
			frest.removeErrorInterceptor(error2.id);
			expect((frest as any).interceptors.after.has(after)).toBe(false);
			expect((frest as any).interceptors.before.has(before)).toBe(false);
			expect((frest as any).interceptors.error.has(error)).toBe(false);
		});

		it('Must set base', () => {
			const frest = new Frest();
			frest.base = 'test';
			expect(frest.config.base).toBe('test');
			expect(frest.base).toBe(frest.config.base);
		});

		it('Must set custom fetch', () => {
			const f = jasmine.createSpy('fetch');
			const frest = new Frest();
			frest.fetchFn = f;
			expect(frest.config.fetch).toBe(f);
			expect(frest.fetchFn).toBe(frest.config.fetch);
		});
	});

	describe('REST Functionality', () => {
		afterEach(fetchMock.restore);

		it('Must call correct endpoint', (done) => {
			fetchMock.once('test', { status: 200 }, { name: 'test', method: 'GET' });
			const frest = new Frest();
			frest.request<any>({ path: 'test', method: 'GET' }).then((res) => {
				if (res) {
					expect(fetchMock.called('test')).toBe(true);
					expect(res.origin.status).toBe(200);
					done();
				} else {
					done.fail('No response returned');
				}
			}).catch(done.fail);
		});

		it('Must call correct endpoint with base', (done) => {
			fetchMock.once('http://localhost/test', { status: 200 }, { name: 'test', method: 'GET' });
			const frest = new Frest({ base: 'http://localhost/' });
			frest.request<any>({ path: 'test', method: 'GET' }).then((res) => {
				if (res) {
					expect(fetchMock.called('test')).toBe(true);
					expect(res.origin.status).toBe(200);
					done();
				} else {
					done.fail('No response returned');
				}
			}).catch(done.fail);
		});

		it('Must call correct endpoint with array path', (done) => {
			fetchMock.once('test/test2', { status: 200 }, { name: 'test', method: 'GET' });
			const frest = new Frest();
			frest.request<any>({ path: ['test', 'test2'], method: 'GET' }).then((res) => {
				if (res) {
					expect(fetchMock.called('test')).toBe(true);
					expect(res.origin.status).toBe(200);
					done();
				} else {
					done.fail('No response returned');
				}
			}).catch(done.fail);
		});

		it('Must call get/read request', (done) => {
			fetchMock.mock('testget', { status: 200 }, { name: 'testget', method: 'GET' })
				.mock('testread', { status: 200 }, { name: 'testread', method: 'GET' });
			const frest = new Frest();
			frest.get<any>('testget').then((res) => {
				if (res) {
					expect(fetchMock.called('testget')).toBe(true);
					expect(res.origin.status).toBe(200);
					return frest.read<any>('testread');
				}
				return Promise.reject('testget: no response returned');
			}).then((res) => {
				if (res) {
					expect(fetchMock.called('testread')).toBe(true);
					expect(res.origin.status).toBe(200);
					done();
				} else {
					done.fail('testread: no response returned');
				}
			}).catch(done.fail);
		});

		it('Must call post/create request', (done) => {
			fetchMock.mock('testpost', { status: 200 }, { name: 'testpost', method: 'POST' })
				.mock('testcreate', { status: 200 }, { name: 'testcreate', method: 'POST' });
			const body = JSON.stringify({ foo: 'bar' });
			const frest = new Frest();
			frest.post<any>('testpost', { body }).then((res) => {
				if (res) {
					expect(fetchMock.called('testpost')).toBe(true);
					expect(res.origin.status).toBe(200);
					return frest.create<any>('testcreate');
				}
				return Promise.reject('testpost: no response returned');
			}).then((res) => {
				if (res) {
					expect(fetchMock.called('testcreate')).toBe(true);
					expect(res.origin.status).toBe(200);
					done();
				} else {
					done.fail('testcreate: no response returned');
				}
			}).catch(done.fail);
		});

		it('Must call put/update request', (done) => {
			fetchMock.mock('testput', { status: 200 }, { name: 'testput', method: 'PUT' })
				.mock('testupdate', { status: 200 }, { name: 'testupdate', method: 'PUT' });
			const body = JSON.stringify({ foo: 'bar' });
			const frest = new Frest();
			frest.put<any>('testput', { body }).then((res) => {
				if (res) {
					expect(fetchMock.called('testput')).toBe(true);
					expect(res.origin.status).toBe(200);
					return frest.update<any>('testupdate');
				}
				return Promise.reject('testput: no response returned');
			}).then((res) => {
				if (res) {
					expect(fetchMock.called('testupdate')).toBe(true);
					expect(res.origin.status).toBe(200);
					done();
				} else {
					done.fail('testupdate: no response returned');
				}
			}).catch(done.fail);
		});

		it('Must call delete/destroy request', (done) => {
			fetchMock.mock('testdelete', { status: 200 }, { name: 'testdelete', method: 'DELETE' })
				.mock('testdestroy', { status: 200 }, { name: 'testdestroy', method: 'DELETE' });
			const body = JSON.stringify({ foo: 'bar' });
			const frest = new Frest();
			frest.delete<any>('testdelete', { body }).then((res) => {
				if (res) {
					expect(fetchMock.called('testdelete')).toBe(true);
					expect(res.origin.status).toBe(200);
					return frest.destroy<any>('testdestroy');
				}
				return Promise.reject('testdelete: no response returned');
			}).then((res) => {
				if (res) {
					expect(fetchMock.called('testdestroy')).toBe(true);
					expect(res.origin.status).toBe(200);
					done();
				} else {
					done.fail('testdestroy: no response returned');
				}
			}).catch(done.fail);
		});

		it('Must call patch request', (done) => {
			fetchMock.once('testpatch', { status: 200 }, { name: 'testpatch', method: 'PATCH' });
			const body = JSON.stringify({ foo: 'bar' });
			const frest = new Frest();
			frest.patch<any>('testpatch', { body }).then((res) => {
				if (res) {
					expect(fetchMock.called('testpatch')).toBe(true);
					expect(res.origin.status).toBe(200);
					done();
				} else {
					done.fail('testpatch: no response returned');
				}
			}).catch(done.fail);
		});

		it('Must be able to use query', (done) => {
			fetchMock.mock('testgetq?baz=daz&foo=bar', { status: 200 }, { name: 'testgetq', method: 'GET' })
				.mock('testreadq?foo=bar&baz=daz', { status: 200 }, { name: 'testreadq', method: 'GET' })
				.mock('testpostq?foo=bar&baz=daz', { status: 200 }, { name: 'testpostq', method: 'POST' })
				.mock('testcreateq?baz=daz&foo=bar', { status: 200 }, { name: 'testcreateq', method: 'POST' })
				.mock('testputq?baz=daz&foo=bar', { status: 200 }, { name: 'testputq', method: 'PUT' })
				.mock('testupdateq?baz=daz&foo=bar', { status: 200 }, { name: 'testupdateq', method: 'PUT' })
				.mock('testdeleteq?baz=daz&foo=bar', { status: 200 }, { name: 'testdeleteq', method: 'DELETE' })
				.mock('testdestroyq?baz=daz&foo=bar', { status: 200 }, { name: 'testdestroyq', method: 'DELETE' })
				.mock('testpatchq?baz=daz&foo=bar', { status: 200 }, { name: 'testpatchq', method: 'PATCH' });
			const frest = new Frest();

			Promise.all([
				frest.get<any>('testgetq', {query: {foo: 'bar', baz: 'daz'}}).then((res) => {
					if (res) {
						expect(fetchMock.called('testgetq')).toBe(true);
						expect(res.origin.status).toBe(200);
						return;
					}
					return Promise.reject('testgetq: no response returned');
				}),
				frest.read<any>('testreadq', {query: 'foo=bar&baz=daz'}).then((res) => {
					if (res) {
						expect(fetchMock.called('testreadq')).toBe(true);
						expect(res.origin.status).toBe(200);
						return;
					}
					return Promise.reject('testreadq: no response returned');
				}),
				frest.post<any>('testpostq', {query: '?foo=bar&baz=daz'}).then((res) => {
					if (res) {
						expect(fetchMock.called('testpostq')).toBe(true);
						expect(res.origin.status).toBe(200);
						return;
					}
					return Promise.reject('testpostq: no response returned');
				}),
				frest.create<any>('testcreateq', {query: {foo: 'bar', baz: 'daz'}}).then((res) => {
					if (res) {
						expect(fetchMock.called('testcreateq')).toBe(true);
						expect(res.origin.status).toBe(200);
						return;
					}
					return Promise.reject('testcreateq: no response returned');
				}),
				frest.put<any>('testputq', {query: {foo: 'bar', baz: 'daz'}}).then((res) => {
					if (res) {
						expect(fetchMock.called('testputq')).toBe(true);
						expect(res.origin.status).toBe(200);
						return;
					}
					return Promise.reject('testputq: no response returned');
				}),
				frest.update<any>('testupdateq', {query: {foo: 'bar', baz: 'daz'}}).then((res) => {
					if (res) {
						expect(fetchMock.called('testupdateq')).toBe(true);
						expect(res.origin.status).toBe(200);
						return;
					}
					return Promise.reject('testupdateq: no response returned');
				}),
				frest.delete<any>('testdeleteq', {query: {foo: 'bar', baz: 'daz'}}).then((res) => {
					if (res) {
						expect(fetchMock.called('testdeleteq')).toBe(true);
						expect(res.origin.status).toBe(200);
						return;
					}
					return Promise.reject('testdeleteq: no response returned');
				}),
				frest.destroy<any>('testdestroyq', {query: {foo: 'bar', baz: 'daz'}}).then((res) => {
					if (res) {
						expect(fetchMock.called('testdestroyq')).toBe(true);
						expect(res.origin.status).toBe(200);
						return;
					}
					return Promise.reject('testdestroyq: no response returned');
				}),
				frest.patch<any>('testpatchq', {query: {foo: 'bar', baz: 'daz'}}).then((res) => {
					if (res) {
						expect(fetchMock.called('testpatchq')).toBe(true);
						expect(res.origin.status).toBe(200);
						return;
					}
					return Promise.reject('testpatchq: no response returned');
				}),
			]).then(done).catch(done.fail);
		});

		it('Must call correct endpoint with config', (done) => {
			fetchMock.once('http://localhost/test', { status: 200 }, { name: 'test', method: 'GET' });
			const frest = new Frest({ base: 'http://localhost/' });
			frest.get<any>({ path: 'test' }).then((res) => {
				if (res) {
					expect(fetchMock.called('test')).toBe(true);
					expect(res.origin.status).toBe(200);
					done();
				} else {
					done.fail('No response returned');
				}
			}).catch(done.fail);
		});

		it('Must handle non ok response', (done) => {
			fetchMock.once('testerror', { status: 500 }, { name: 'testerror', method: 'GET' });
			const frest = new Frest();
			frest.get<any>('testerror').then(() => {
				done.fail('testerror: error is not thrown');
			}).catch((err: IFrestError) => {
				expect(err).toBeDefined();
				expect(err.response).toBeDefined();
				expect((err.response as any).origin).toBeDefined();
				expect((err.response as any).origin.status).toBe(500);
				done();
			});
		});
	});

	describe('Interceptors', () => {
		afterEach(fetchMock.restore);

		it('Must be able to intercept request', (done) => {
			const headers = new Headers();
			headers.append('x-test', 'test');
			const path = 'testbefore';
			const before = jasmine.createSpy('before').and
				.returnValue(Promise.resolve({ path, headers }));

			fetchMock.once(
				(url: string, opts: Request) =>
					url === path && opts.headers.get('x-test') === 'test',
				{ status: 200 }, { name: path, method: 'GET' });

			const frest = new Frest({ interceptors: { before: [before] } });
			frest.get<any>(path)
				.then((_) => {
					expect(before).toHaveBeenCalledTimes(1);
					expect(fetchMock.called(path)).toBe(true);
					done();
				}).catch(done.fail);
		});

		it('Must be able to intercept response', (done) => {
			const path = 'testafter';
			const after = jasmine.createSpy('after').and
				.callFake((input: AfterResponseInterceptorArg) => {
					const promise = new Promise<WrappedFrestResponse<any>>((resolve) => {
						input.response.origin.json()
							.then((value) => resolve({ origin: input.response.origin, value }));
					});
					return promise;
				});
			fetchMock.once(path,
				{ status: 200, body: { foo: 'bar' } },
				{ name: path, method: 'POST' });

			const frest = new Frest({ interceptors: { after: [after] } });
			frest.post<any>(path)
				.then((res) => {
					expect(after).toHaveBeenCalledTimes(1);
					expect(fetchMock.called(path)).toBe(true);
					if (isWrapped(res)) {
						expect(res.value).toBeTruthy();
						expect(res.value).toEqual({ foo: 'bar' });
						done();
					} else {
						done.fail('invalid response');
					}
				})
				.catch(done.fail);
		});

		it('Must be able to unwrap response', (done) => {
			const path = 'testafter';
			const after = jasmine.createSpy('after').and
				.callFake((input: AfterResponseInterceptorArg) => {
					const promise = new Promise<WrappedFrestResponse<any>>((resolve) => {
						input.response.origin.json()
							.then((value) => resolve({ origin: input.response.origin, value }));
					});
					return promise;
				});
			fetchMock.once(path,
				{ status: 200, body: { foo: 'bar' } },
				{ name: path, method: 'PUT' });

			const frest = new Frest({ interceptors: { after: [after] } });
			frest.put<any>(path, { nowrap: true })
				.then((res) => {
					expect(after).toHaveBeenCalledTimes(1);
					expect(fetchMock.called(path)).toBe(true);
					if (!isWrapped(res)) {
						expect(res).toBeTruthy();
						expect(res).toEqual({ foo: 'bar' });
						done();
					} else {
						done.fail('invalid response');
					}
				})
				.catch(done.fail);
		});

		it('Must be able to intercept errors', (done) => {
			const path = 'testerror';
			const error = jasmine.createSpy('error').and
				.returnValue(Promise.resolve(null));
			const before = jasmine.createSpy('before').and
				.returnValue(Promise.reject('some error'));

			const frest = new Frest({ interceptors: { before: [before], error: [error] } });
			frest.request<any>(path)
				.then((_) => {
					done.fail('Error is not thrown');
				})
				.catch((err) => {
					expect(err).toBeDefined();
					expect(error).toHaveBeenCalledTimes(1);
					expect(err.message).toContain('some error');
					done();
				});
		});

		it('Must be able to intercept errors & recover', (done) => {
			const path = 'testerror';
			const error = jasmine.createSpy('error').and
				.returnValue(Promise.resolve({ foo: 'bar' }));
			const after = jasmine.createSpy('before').and
				.returnValue(Promise.reject('some error'));
			fetchMock.once(path, { status: 200 }, { name: path, method: 'GET' });

			const frest = new Frest({ interceptors: { after: [after], error: [error] } });
			frest.get<any>(path)
				.then((res) => {
					expect(fetchMock.called(path)).toBe(true);
					expect(error).toHaveBeenCalledTimes(1);
					expect(res.foo).toBe('bar');
					done();
				})
				.catch(done.fail);
		});
	});
});
