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
import { BASE, instances } from '../fixtures';

test('string arg must become path', async t => {
  const { frest, fm, url, path } = instances();
  fm.getOnce(url, {}, { method: 'GET', name: path });

  const res = await frest.request(path);
  const lastOptions = fm.lastOptions(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is(lastOptions.method, 'GET');
  t.truthy(lastOptions.headers);
});

test('string array arg must become path', async t => {
  const { frest, fm } = instances();
  fm.getOnce(`${BASE}/foo/bar`, {}, { method: 'GET', name: 'foobar' });

  const res = await frest.request(['foo', 'bar']);
  const lastOptions = fm.lastOptions('foobar');
  t.true(res.origin.ok);
  t.true(fm.called('foobar'));
  t.is(lastOptions.method, 'GET');
});

test('object arg string path', async t => {
  const { frest, fm, path, url } = instances();
  fm.postOnce(url, {}, { method: 'POST', name: path });

  const res = await frest.request({
    method: 'POST',
    path,
  });
  const lastOptions = fm.lastOptions(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is(lastOptions.method, 'POST');
});

test('object arg string array', async t => {
  const url = `${BASE}/foo/bar/baz`;
  const { frest, fm } = instances();
  fm.putOnce(url, {}, { method: 'PUT', name: 'foobarbaz' });

  const res = await frest.request({
    method: 'PUT',
    path: ['foo', 'bar', 'baz'],
  });
  const lastOptions = fm.lastOptions('foobarbaz');
  t.true(res.origin.ok);
  t.true(fm.called('foobarbaz'));
  t.is(lastOptions.method, 'PUT');
});

test('object arg headers', async t => {
  const { frest, fm, path, url } = instances();
  fm.getOnce(
    url,
    {},
    { method: 'GET', name: path, headers: { 'X-FOO': 'bar' } },
  );

  const res = await frest.request({
    headers: new Headers({ 'X-FOO': 'bar' }),
    path,
  });
  const lastOptions = fm.lastOptions(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is(lastOptions.method, 'GET');
  if (lastOptions.headers instanceof Headers) {
    t.is(lastOptions.headers.get('X-FOO'), 'bar');
  } else {
    t.fail('Unexpected headers');
  }
});

test('both arg', async t => {
  const { frest, fm, path, url } = instances();
  fm.deleteOnce(url, {}, { method: 'DELETE', name: path });

  const res = await frest.request(path, { method: 'DELETE' });
  t.true(res.origin.ok);
  t.true(fm.called(path));
});

test('request & instance config merge', async t => {
  const { frest, fm, path, url } = instances({
    credentials: 'include',
  });
  fm.once(url, {}, { method: 'GET', name: path });

  const res = await frest.request({ path, cache: 'default' });
  const lastOptions = fm.lastOptions(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is(lastOptions.cache, 'default');
  t.is(lastOptions.credentials, 'include');
});
