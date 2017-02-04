// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import fetchMock from 'fetch-mock';
import frest from 'frest/index';

describe('Default Frest Instance', () => {
	afterEach(fetchMock.restore);

	it('Must call default request method', (done) => {
		fetchMock.mock('testd', { status: 200 }, { name: 'testd', method: 'GET' });

		// must provide fetch here although it's the default because of late fetchMock hook
		frest.request<any>({ path: 'testd', method: 'GET', fetch: window.fetch }).then((res) => {
				if (res) {
					expect(fetchMock.called('testd')).toBe(true);
					expect(res.origin.status).toBe(200);
					done();
				} else {
					done.fail('No response returned');
				}
			}).catch((done.fail));
	});
});
