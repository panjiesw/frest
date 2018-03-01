/**
 * Copyright (c) 2018 Panjie Setiawan Wicaksono
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import test from 'ava';
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
