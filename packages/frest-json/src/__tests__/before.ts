/**
 * Copyright (c) 2018 Panjie Setiawan Wicaksono
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import test from 'ava';
import { BASE, instances, randomStr } from './fixtures';
import { before, ID_BEFORE } from '../';

test('must JSON.stringify object', async t => {
  const body = { foo: 'bar', doo: 1 };
  const exp = JSON.stringify(body);
  const int = before();
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
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
  const int = before({ headerAccept, headerContent });
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
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
  const int = before();
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
  });
  fm.once(url, {}, { method: 'GET', name: path });

  const res = await frest.request(path, { body, skip: [ID_BEFORE] });
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
  const int = before();
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
  });
  fm.once(url, {}, { method: 'GET', name: path });

  const res = await frest.request(path, { body, skip: [ID_BEFORE] });
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
  const int = before({ method: ['GET', 'PUT'] });
  const { frest, fm, url, path } = instances({
    interceptors: { before: [int] },
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
