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
import sinon from 'sinon';
import { instances } from 'frest/lib/__tests__/fixtures';
import { before, scheme, ID_BEFORE, IAuthScheme } from '../..';

test('scheme Basic', async t => {
  const getToken = sinon.stub().returns('token');
  const sc = scheme.basicAuth(getToken);
  const int = before(sc);
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
  });
  fm.once(url, {}, { method: 'GET', name: path });

  const res = await frest.request(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is(
    (fm.lastOptions(path).headers as Headers).get(sc.name!),
    `${sc.prefix}token`,
  );
});

test('scheme Bearer', async t => {
  const getToken = sinon.stub().returns('token');
  const sc = scheme.basicAuth(getToken);
  const int = before(sc);
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
  });
  fm.once(url, {}, { method: 'GET', name: path });

  const res = await frest.request(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is(
    (fm.lastOptions(path).headers as Headers).get(sc.name!),
    `${sc.prefix}token`,
  );
});

test('scheme Basic skip', async t => {
  const getToken = sinon.stub().returns('token');
  const sc = scheme.basicAuth(getToken);
  const int = before(sc);
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
  });
  fm.once(url, {}, { method: 'GET', name: path });

  const res = await frest.request(path, { skip: [ID_BEFORE] });
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.not(
    (fm.lastOptions(path).headers as Headers).get(sc.name!),
    `${sc.prefix}token`,
  );
});

test('scheme no token', async t => {
  const sc = scheme.basicAuth();
  const int = before(sc);
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
  });
  fm.once(url, {}, { method: 'GET', name: path });

  const res = await frest.request(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.false((fm.lastOptions(path).headers as Headers).has(sc.name!));
});

test('scheme no name', async t => {
  const sc: IAuthScheme = {
    token: sinon.stub().returns('token'),
    attach: 'header',
  };
  const int = before(sc);
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
  });
  fm.once(url, {}, { method: 'GET', name: path });

  const res = await frest.request(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is((fm.lastOptions(path).headers as Headers).get('Authorization'), 'token');
});

test('scheme query', async t => {
  const name = 'x-auth';
  const token = 'token';
  const query = '?x-auth=token';
  const sc: IAuthScheme = {
    name,
    token: sinon.stub().returns(token),
    attach: 'query',
  };
  const int = before(sc);
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
  });
  fm.once(`${url}${query}`, {}, { method: 'GET', name: path });

  const res = await frest.request(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
});

test('scheme query existing object', async t => {
  const name = 'x-auth';
  const token = 'token';
  const query = '?foo=bar&x-auth=token';
  const sc: IAuthScheme = {
    name,
    token: sinon.stub().returns(token),
    attach: 'query',
  };
  const int = before(sc);
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
  });
  fm.once(`${url}${query}`, {}, { method: 'GET', name: path });

  const res = await frest.request(path, { query: { foo: 'bar' } });
  t.true(res.origin.ok);
  t.true(fm.called(path));
});

test('scheme query existing string', async t => {
  const name = 'x-auth';
  const token = 'token';
  const query = '?foo=bar&x-auth=token';
  const sc: IAuthScheme = {
    name,
    token: sinon.stub().returns(token),
    attach: 'query',
  };
  const int = before(sc);
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
  });
  fm.once(`${url}${query}`, {}, { method: 'GET', name: path });

  const res = await frest.request(path, { query: 'foo=bar' });
  t.true(res.origin.ok);
  t.true(fm.called(path));
});

test('scheme query existing string empty', async t => {
  const name = 'x-auth';
  const token = 'token';
  const query = '?x-auth=token';
  const sc: IAuthScheme = {
    name,
    token: sinon.stub().returns(token),
    attach: 'query',
  };
  const int = before(sc);
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
  });
  fm.once(`${url}${query}`, {}, { method: 'GET', name: path });

  const res = await frest.request(path, { query: '' });
  t.true(res.origin.ok);
  t.true(fm.called(path));
});
