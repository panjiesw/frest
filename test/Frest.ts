// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import fetchMock from 'fetch-mock';
import { Frest } from 'frest/Frest';
import {
	WrappedFrestResponse,
} from 'frest/shapes';

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
			const config = {
				interceptors: {
					after: [after],
					before: [before],
					error: [error],
				},
			};
			const frest = new Frest(config);
			frest.addAfterResponseInterceptor(jasmine.createSpy('after2'));
			frest.addBeforeRequestInterceptor(jasmine.createSpy('before2'));
			frest.addErrorInterceptor(jasmine.createSpy('error2'));
			expect((frest as any).interceptors.after.size).toBe(2);
			expect((frest as any).interceptors.before.size).toBe(2);
			expect((frest as any).interceptors.error.size).toBe(2);
			frest.removeAfterResponseInterceptor(after);
			frest.removeBeforeRequestInterceptor(before);
			frest.removeErrorInterceptor(error);
			expect((frest as any).interceptors.after.has(after)).toBe(false);
			expect((frest as any).interceptors.before.has(before)).toBe(false);
			expect((frest as any).interceptors.error.has(error)).toBe(false);
		});
	});

	describe('REST Functionality', () => {
		afterEach(fetchMock.restore);

		it('Must call correct endpoint', (done) => {
			fetchMock.once('test', { status: 200 }, { name: 'test', method: 'GET' });
			const frest = new Frest();
			frest.request<WrappedFrestResponse<any>>({ path: 'test', method: 'GET' }).then((res) => {
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
			frest.request<WrappedFrestResponse<any>>({ path: 'test', method: 'GET' }).then((res) => {
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
			frest.get<WrappedFrestResponse<any>>('testget').then((res) => {
				if (res) {
					expect(fetchMock.called('testget')).toBe(true);
					expect(res.origin.status).toBe(200);
					return frest.read<WrappedFrestResponse<any>>('testread');
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
			frest.post<WrappedFrestResponse<any>>('testpost', { body }).then((res) => {
				if (res) {
					expect(fetchMock.called('testpost')).toBe(true);
					expect(res.origin.status).toBe(200);
					return frest.create<WrappedFrestResponse<any>>('testcreate');
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
			frest.put<WrappedFrestResponse<any>>('testput', { body }).then((res) => {
				if (res) {
					expect(fetchMock.called('testput')).toBe(true);
					expect(res.origin.status).toBe(200);
					return frest.update<WrappedFrestResponse<any>>('testupdate');
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
			frest.delete<WrappedFrestResponse<any>>('testdelete', { body }).then((res) => {
				if (res) {
					expect(fetchMock.called('testdelete')).toBe(true);
					expect(res.origin.status).toBe(200);
					return frest.destroy<WrappedFrestResponse<any>>('testdestroy');
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
			frest.patch<WrappedFrestResponse<any>>('testpatch', { body }).then((res) => {
				if (res) {
					expect(fetchMock.called('testpatch')).toBe(true);
					expect(res.origin.status).toBe(200);
					done();
				} else {
					done.fail('testpatch: no response returned');
				}
			}).catch(done.fail);
		});
	});
});
