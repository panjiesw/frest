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
import { FrestError } from 'frest';
import { instances } from 'frest/lib/__tests__/fixtures';
import { responseInterceptor, ID_RESPONSE } from '../../';

test('must parse json response', async t => {
  const exp = { foo: 'bar', doo: 1 };
  const body = JSON.stringify(exp);
  const int = responseInterceptor();
  const { frest, fm, url, path } = instances({
    interceptors: { response: [int] },
  });
  fm.once(
    url,
    {
      body,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    },
    { method: 'GET', name: path },
  );

  const res = await frest.get(path);
  t.true(res.origin.ok);
  t.deepEqual(res.body, exp);
});

test('must parse json response if force is true', async t => {
  const exp = { foo: 'bar', doo: 1 };
  const body = JSON.stringify(exp);
  const int = responseInterceptor({ force: true });
  const { frest, fm, url, path } = instances({
    interceptors: { response: [int] },
  });
  fm.once(
    url,
    {
      body,
    },
    { method: 'GET', name: path },
  );

  const res = await frest.get(path);
  t.true(res.origin.ok);
  t.deepEqual(res.body, exp);
});

test('must parse json with custom response header', async t => {
  const exp = { foo: 'bar', doo: 1 };
  const body = JSON.stringify(exp);
  const int = responseInterceptor({ headerContent: 'text/json' });
  const { frest, fm, url, path } = instances({
    interceptors: { response: [int] },
  });
  fm.once(
    url,
    {
      body,
      headers: new Headers({ 'Content-Type': 'text/json' }),
    },
    { method: 'GET', name: path },
  );

  const res = await frest.get(path);
  t.true(res.origin.ok);
  t.deepEqual(res.body, exp);
});

test('must skip', async t => {
  const exp = { foo: 'bar', doo: 1 };
  const body = JSON.stringify(exp);
  const int = responseInterceptor();
  const { frest, fm, url, path } = instances({
    interceptors: { response: [int] },
  });
  fm.once(
    url,
    {
      body,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    },
    { method: 'GET', name: path },
  );

  const res = await frest.get(path, { skip: [ID_RESPONSE] });
  t.true(res.origin.ok);
  t.notDeepEqual(res.body, exp);
});

test('must handle empty content', async t => {
  const int = responseInterceptor({ headerContent: 'text/json' });
  const { frest, fm, url, path } = instances({
    interceptors: { response: [int] },
  });
  fm.once(
    url,
    {
      status: 201,
      body: '',
      headers: new Headers({ 'Content-Type': 'text/json' }),
    },
    { method: 'GET', name: path },
  );

  const res = await frest.get(path);
  t.true(res.origin.ok);
  t.is(res.body, undefined);
});

test('must handle parsing error', async t => {
  const int = responseInterceptor({ headerContent: 'text/json' });
  const { frest, fm, url, path } = instances({
    interceptors: { response: [int] },
  });
  fm.once(
    url,
    {
      body: '"',
      headers: new Headers({ 'Content-Type': 'text/json' }),
    },
    { method: 'GET', name: path },
  );

  const res: FrestError = await t.throws(frest.get(path));
  t.true(res.message.indexOf('invalid json response body') > -1);
});
