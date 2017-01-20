// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import fetchMock from 'fetch-mock';
import { Frest } from 'frest/Frest';
import { IFrest } from 'frest/shapes';

describe('Frest', () => {
	let frest: IFrest;

	beforeEach(() => {
		frest = new Frest();
	});

	afterEach(fetchMock.restore);

	describe('Basic Functionality', () => {
		it('Construct', () => {
			expect(frest.config).toEqual({ base: '', fetch, interceptors: {} });
		});
	});
});
