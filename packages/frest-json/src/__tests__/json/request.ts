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
import { BASE, instances, randomStr } from 'frest/lib/__tests__/fixtures';
import { requestInterceptor, ID_REQUEST } from '../../';

test('must JSON.stringify object', async t => {
  const body = { foo: 'bar', doo: 1 };
  const exp = JSON.stringify(body);
  const int = requestInterceptor();
  const { frest, fm, url, path } = instances({
    interceptors: { request: [int] },
  });
  fm.postOnce(url, {}, { method: 'POST', name: path });

  const res = await frest.request(path, { body, method: 'POST' });
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is((fm.lastOptions(path) as any).body, exp);
  t.is(
    (fm.lastOptions(path).headers as Headers).get('Content-Type'),
    'application/json',
  );
  t.is(
    (fm.lastOptions(path).headers as Headers).get('Accept'),
    'application/json',
  );
});

test('with custom headers value', async t => {
  const body = { foo: 'bar', doo: 1 };
  const exp = JSON.stringify(body);
  const headerContent = 'application/json;charset=utf-8';
  const headerAccept = 'application/json;charset=utf-8';
  const int = requestInterceptor({ headerAccept, headerContent });
  const { frest, fm, url, path } = instances({
    interceptors: { request: [int] },
  });
  fm.postOnce(url, {}, { method: 'POST', name: path });

  const res = await frest.post(path, { body });
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is((fm.lastOptions(path) as any).body, exp);
  t.is(
    (fm.lastOptions(path).headers as Headers).get('Content-Type'),
    headerContent,
  );
  t.is((fm.lastOptions(path).headers as Headers).get('Accept'), headerAccept);
});

test('must skip', async t => {
  const body = { foo: 'bar', doo: 1 };
  const int = requestInterceptor();
  const { frest, fm, url, path } = instances({
    interceptors: { request: [int] },
  });
  fm.once(url, {}, { method: 'GET', name: path });

  const res = await frest.request(path, { body, skip: [ID_REQUEST] });
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.not(
    (fm.lastOptions(path).headers as Headers).get('Content-Type'),
    'application/json',
  );
  t.not(
    (fm.lastOptions(path).headers as Headers).get('Accept'),
    'application/json',
  );
});

test('must skip if body is form data', async t => {
  const body = new FormData();
  body.append('foo', 'bar');
  const int = requestInterceptor();
  const { frest, fm, url, path } = instances({
    interceptors: { request: [int] },
  });
  fm.once(url, {}, { method: 'GET', name: path });

  const res = await frest.request(path, { body, skip: [ID_REQUEST] });
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.not(
    (fm.lastOptions(path).headers as Headers).get('Content-Type'),
    'application/json',
  );
  t.not(
    (fm.lastOptions(path).headers as Headers).get('Accept'),
    'application/json',
  );
});

test('must skip if method is not as defined', async t => {
  const body = { foo: 'bar', doo: 1 };
  const int = requestInterceptor({ method: ['GET', 'PUT'] });
  const { frest, fm, url, path } = instances({
    interceptors: { request: [int] },
  });
  const path2 = randomStr();
  const url2 = `${BASE}/${path2}`;
  const path3 = randomStr();
  const url3 = `${BASE}/${path3}`;

  fm
    .once(url, {}, { method: 'GET', name: path })
    .once(url2, {}, { method: 'PUT', name: path2 })
    .once(url3, {}, { method: 'POST', name: path3 });

  const res = await frest.get(path, { body });
  const res2 = await frest.put(path2, { body });
  const res3 = await frest.post(path3, { body });

  t.true(res.origin.ok);
  t.true(res2.origin.ok);
  t.true(res3.origin.ok);
  t.true(fm.called(path));
  t.true(fm.called(path2));
  t.true(fm.called(path3));
  t.is(
    (fm.lastOptions(path).headers as Headers).get('Content-Type'),
    'application/json',
  );
  t.is(
    (fm.lastOptions(path).headers as Headers).get('Accept'),
    'application/json',
  );
  t.is(
    (fm.lastOptions(path2).headers as Headers).get('Content-Type'),
    'application/json',
  );
  t.is(
    (fm.lastOptions(path2).headers as Headers).get('Accept'),
    'application/json',
  );
  t.not(
    (fm.lastOptions(path3).headers as Headers).get('Content-Type'),
    'application/json',
  );
  t.not(
    (fm.lastOptions(path3).headers as Headers).get('Accept'),
    'application/json',
  );
});
