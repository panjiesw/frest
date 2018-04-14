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

test('post & create', async t => {
  const { frest, fm, path, url } = instances();
  fm.mock(
    (u, o) =>
      u === url &&
      ((o as any).action === 'post' || (o as any).action === 'create'),
    {},
    { method: 'POST', name: path },
  );

  const res1 = await frest.post(path);
  const res2 = await frest.create(path);

  t.true(res1.origin.ok);
  t.true(res2.origin.ok);
  t.is(fm.calls(path).length, 2);
});

test('get & read', async t => {
  const { frest, fm, path, url } = instances();
  fm.get(
    (u, o) =>
      u === url &&
      ((o as any).action === 'get' || (o as any).action === 'read'),
    {},
    { method: 'GET', name: path },
  );

  const res1 = await frest.get(path);
  const res2 = await frest.read(path);

  t.true(res1.origin.ok);
  t.true(res2.origin.ok);
  t.is(fm.calls(path).length, 2);
});

test('put & update', async t => {
  const { frest, fm, path, url } = instances();
  fm.put(
    (u, o) =>
      u === url &&
      ((o as any).action === 'put' || (o as any).action === 'update'),
    {},
    { method: 'PUT', name: path },
  );

  const res1 = await frest.put(path);
  const res2 = await frest.update(path);

  t.true(res1.origin.ok);
  t.true(res2.origin.ok);
  t.is(fm.calls(path).length, 2);
});

test('delete & destroy', async t => {
  const { frest, fm, path, url } = instances();
  fm.delete(
    (u, o) =>
      u === url &&
      ((o as any).action === 'delete' || (o as any).action === 'destroy'),
    {},
    { method: 'DELETE', name: path },
  );

  const res1 = await frest.delete(path);
  const res2 = await frest.destroy(path);

  t.true(res1.origin.ok);
  t.true(res2.origin.ok);
  t.is(fm.calls(path).length, 2);
});

test('patch', async t => {
  const { frest, fm, path, url } = instances();
  const opts: any = { method: 'PATCH', name: path };
  fm.patchOnce(url, {}, opts);

  const res1 = await frest.patch(path);

  t.true(res1.origin.ok);
  t.true(fm.called(path));
});

test('option', async t => {
  const { frest, fm, path, url } = instances();
  fm.once(url, {}, { method: 'OPTION', name: path });

  const res1 = await frest.option(path);

  t.true(res1.origin.ok);
  t.true(fm.called(path));
});
