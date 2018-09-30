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
import { instances } from '../fixtures';

test('object', async t => {
  const { frest, fm, url, path } = instances();
  const query = 'foo=bar&woo=wah';

  fm.once(`${url}?${query}`, {}, { method: 'GET', name: path });

  const res = await frest.get(path, { query: { foo: 'bar', woo: 'wah' } });
  t.true(res.origin.ok);
  t.true(fm.called(path));
});

test('empty object', async t => {
  const { frest, fm, url, path } = instances();

  fm.once(url, {}, { method: 'GET', name: path });

  const res = await frest.get(path, { query: {} });
  t.true(res.origin.ok);
  t.true(fm.called(path));
});

test('string', async t => {
  const { frest, fm, url, path } = instances();
  const query = 'foo=bar&woo=wah';

  fm.once(`${url}?${query}`, {}, { method: 'GET', name: path });

  const res = await frest.get(path, { query });
  t.true(res.origin.ok);
  t.true(fm.called(path));
});

test('string question mark', async t => {
  const { frest, fm, url, path } = instances();
  const query = 'foo=bar&woo=wah';

  fm.once(`${url}?${query}`, {}, { method: 'GET', name: path });

  const res = await frest.get(path, { query: `?${query}` });
  t.true(res.origin.ok);
  t.true(fm.called(path));
});
