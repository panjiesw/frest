// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import fetchMock from 'fetch-mock';
import { Frest } from 'frest/Frest';

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
	});
});
