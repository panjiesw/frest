/**
 * Copyright (c) 2018 Panjie Setiawan Wicaksono
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import test from 'ava';
import { FrestError } from 'frest';
import { instances } from '../fixtures';
import { after, ID_AFTER } from '../../';

test('must parse json response', async t => {
  const exp = { foo: 'bar', doo: 1 };
  const body = JSON.stringify(exp);
  const int = after();
  const { frest, fm, url, path } = instances({
    interceptors: { after: [int] },
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
  const int = after({ force: true });
  const { frest, fm, url, path } = instances({
    interceptors: { after: [int] },
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
  const int = after({ headerContent: 'text/json' });
  const { frest, fm, url, path } = instances({
    interceptors: { after: [int] },
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
  const int = after();
  const { frest, fm, url, path } = instances({
    interceptors: { after: [int] },
  });
  fm.once(
    url,
    {
      body,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    },
    { method: 'GET', name: path },
  );

  const res = await frest.get(path, { skip: [ID_AFTER] });
  t.true(res.origin.ok);
  t.notDeepEqual(res.body, exp);
});

test('must handle empty content', async t => {
  const int = after({ headerContent: 'text/json' });
  const { frest, fm, url, path } = instances({
    interceptors: { after: [int] },
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
  const int = after({ headerContent: 'text/json' });
  const { frest, fm, url, path } = instances({
    interceptors: { after: [int] },
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
