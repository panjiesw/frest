/**
 * Copyright (c) 2018 Panjie Setiawan Wicaksono
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import test from 'ava';
import { FrestError, IResponse } from 'frest';
import { instances } from '../fixtures';
import { error, ID_ERROR } from '../../';

test('must handle http error', async t => {
  const exp = { foo: 'bar', doo: 1 };
  const body = JSON.stringify(exp);
  const int = error();
  const { frest, fm, url, path } = instances({
    interceptors: { error: [int] },
  });
  fm.once(
    url,
    {
      body,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      status: 400,
    },
    { method: 'GET', name: path },
  );

  const res: FrestError = await t.throws(frest.get(path));
  const response: IResponse = res.response as IResponse;
  t.truthy(response);
  t.false(response.origin.ok);
  t.deepEqual(response.body, exp);
});

test('must handle http error with custom header', async t => {
  const exp = { foo: 'bar', doo: 1 };
  const body = JSON.stringify(exp);
  const int = error({ headerContent: 'text/json' });
  const { frest, fm, url, path } = instances({
    interceptors: { error: [int] },
  });
  fm.once(
    url,
    {
      body,
      headers: new Headers({ 'Content-Type': 'text/json' }),
      status: 404,
    },
    { method: 'GET', name: path },
  );

  const res: FrestError = await t.throws(frest.get(path));
  const response: IResponse = res.response as IResponse;
  t.truthy(response);
  t.false(response.origin.ok);
  t.deepEqual(response.body, exp);
});

test('must skip', async t => {
  const int = error({ headerContent: 'application/json' });
  const { frest, fm, url, path } = instances({
    interceptors: { error: [int] },
  });
  fm.once(
    url,
    {
      body: '',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      status: 404,
    },
    { method: 'GET', name: path },
  );

  const res: FrestError = await t.throws(frest.get(path, { skip: [ID_ERROR] }));
  const response: IResponse = res.response as IResponse;
  t.truthy(response);
  t.false(response.origin.ok);
  t.falsy(response.body);
});
