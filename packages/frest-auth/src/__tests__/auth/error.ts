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
import { error /* scheme, ID_ERROR */ } from '../..';

test('default to throw', async t => {
  const int = error();
  const { frest, fm, url, path } = instances({
    interceptors: { error: [int] },
  });
  fm.once(url, { status: 401 }, { method: 'GET', name: path });

  await t.throws(frest.request(path));
  t.true(fm.called(path));
});

test('default retry', async t => {
  const count = 3;
  // fast delay for test
  const int = error({ count, delay: 10 });
  const { frest, fm, url, path } = instances({
    interceptors: { error: [int] },
  });
  fm.mock(url, { status: 401 }, { method: 'POST', name: path });

  await t.throws(frest.post(path));
  t.true(fm.called(path));
  t.is(fm.calls(path).length, count + 1);
});

test('retry condition', async t => {
  const { frest, fm, url, path } = instances();
  const condition = sinon
    .stub()
    .callsFake(
      (_, req, res) => res.origin.status === 401 && req.action !== 'skip',
    );
  const int = error({ condition, count: 1 });
  frest.mergeConfig({ interceptors: { error: [int] } });
  fm.mock(url, { status: 401 }, { method: 'PUT', name: path });

  await t.throws(frest.put(path, { action: 'skip' }));
  t.true(fm.called(path));
  t.is(fm.calls(path).length, 1);
  t.true(condition.calledOnce);
});
