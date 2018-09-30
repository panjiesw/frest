/**
 *    Copyright 2018 Panjie Setiawan Wicaksono
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import test from 'ava';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import Frest, { IResponseInterceptorArg, IFrestError } from '../../';
import { BASE } from '../fixtures';

test('constructor interceptors', t => {
  const int: any = sinon.spy();
  int.id = 'test';

  const frest = new Frest({
    interceptors: {
      response: [int],
      request: [int],
      error: [int],
    },
  });

  t.is(frest.config.interceptors.response.length, 1);
  t.is(frest.config.interceptors.request.length, 1);
  t.is(frest.config.interceptors.error.length, 1);
});

test('has interceptor', t => {
  const int: any = sinon.spy();
  int.id = 'test';
  const int2: any = sinon.spy();
  int2.id = 'test2';

  const frest = new Frest({
    interceptors: {
      response: [int],
      error: [int2],
    },
  });

  t.true(frest.hasInterceptor(int.id));
  t.true(frest.hasInterceptor(int2.id));
  t.false(frest.hasInterceptor('foo'));
});

test('add-remove', t => {
  const int: any = sinon.spy();
  int.id = 'test';

  const frest = new Frest();

  frest.addResponseInterceptor(int);
  t.is(frest.config.interceptors.response.length, 1);
  frest.removeResponseInterceptor(int.id);
  t.is(frest.config.interceptors.response.length, 0);
  frest.addResponseInterceptor(int);
  t.is(frest.config.interceptors.response.length, 1);
  frest.removeResponseInterceptor(int);
  t.is(frest.config.interceptors.response.length, 0);

  frest.addRequestInterceptor(int);
  t.is(frest.config.interceptors.request.length, 1);
  frest.removeRequestInterceptor(int.id);
  t.is(frest.config.interceptors.request.length, 0);
  frest.addRequestInterceptor(int);
  t.is(frest.config.interceptors.request.length, 1);
  frest.removeRequestInterceptor(int);
  t.is(frest.config.interceptors.request.length, 0);

  frest.addErrorInterceptor(int);
  t.is(frest.config.interceptors.error.length, 1);
  frest.removeErrorInterceptor(int.id);
  t.is(frest.config.interceptors.error.length, 0);
  frest.addErrorInterceptor(int);
  t.is(frest.config.interceptors.error.length, 1);
  frest.removeErrorInterceptor(int);
  t.is(frest.config.interceptors.error.length, 0);
});

test('before request interceptor', async t => {
  const url = `${BASE}/before`;
  const fm = fetchMock.once(url, {});
  const order: string[] = [];
  const int1: any = sinon.stub().callsFake(r => {
    order.push('int1');
    return Promise.resolve(r.request);
  });
  int1.id = 'int1';
  const int2: any = sinon.stub().callsFake(r => {
    order.push('int2');
    r.request.foo = 'bar';
    return Promise.resolve(r.request);
  });
  int2.id = 'int2';
  const frest = new Frest({
    base: BASE,
    fetch,
    interceptors: {
      request: [int1],
    },
  });
  frest.addRequestInterceptor(int2);

  const res = await frest.request<{}>('before');
  t.true(res.origin.ok);
  t.true(fm.called(url));
  t.is((fm.lastOptions() as any).foo, 'bar');
  t.true(int1.calledOnce);
  t.true(int2.calledOnce);
  t.is(order[0], 'int1');
  t.is(order[1], 'int2');
});

test('after response interceptor', async t => {
  const url = `${BASE}/after`;
  const expectedResponse = {
    foo: 'bar',
  };
  const fm = fetchMock.once(url, expectedResponse);
  const int = sinon.stub().callsFake(async (arg: IResponseInterceptorArg) => {
    arg.response.body = await arg.response.origin.json();
    return arg.response;
  });

  const frest = new Frest({
    base: BASE,
    fetch,
    interceptors: {
      response: [int],
    },
  });

  const res = await frest.request<{ foo: string }>('after');
  t.true(res.origin.ok);
  t.true(res.origin.bodyUsed);
  t.true(fm.called());
  t.true(int.calledOnce);
  t.deepEqual(res.body, expectedResponse);
});

test('error interceptor not recovered', async t => {
  const url = `${BASE}/error`;
  const fm = fetchMock.once(url, {
    status: 500,
  });
  const int = sinon.stub().callsFake(() => Promise.resolve(null));

  const frest = new Frest({
    base: BASE,
    fetch,
    interceptors: {
      error: [int],
    },
  });

  await t.throws(frest.request('error'));
  t.true(fm.called());
  t.true(int.calledOnce);
});

test('error interceptor recovered', async t => {
  const url = `${BASE}/error-recovered`;
  const fm = fetchMock.once(url, {
    body: {
      error: 'test',
    },
    status: 401,
  });
  const int = sinon.stub().callsFake(async (err: IFrestError) => {
    if (err.response) {
      const value = await err.response.origin.json();
      err.response.body = value;
      return err.response;
    }
    return null;
  });

  const frest = new Frest({
    base: BASE,
    fetch,
    interceptors: {
      error: [int],
    },
  });

  const res = await frest.request<{ error: string }>('error-recovered');
  t.false(res.origin.ok);
  t.deepEqual(res.body, { error: 'test' });
  t.true(fm.called());
  t.true(int.calledOnce);
});
