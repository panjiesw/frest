/**
 * Copyright (c) 2018 Panjie Setiawan Wicaksono
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import test from 'ava';
import fetchMock from 'fetch-mock';
import { BASE, getInstance } from './fixtures';
import { before } from '../before';

test.serial('before must JSON.stringify object', async t => {
  const body = { foo: 'bar', doo: 1 };
  const exp = JSON.stringify(body);
  const url = `${BASE}/jsonbefore`;
  const fm = fetchMock.once(
    (u, o) => u === url && (o as RequestInit).body === exp,
    {},
    {
      name: 'jsonbefore',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );
  const int = before();
  const frest = getInstance({ interceptors: { before: [int] } });

  const res = await frest.post('jsonbefore', { body });
  t.true(res.origin.ok);
  t.true(fm.called(url));
});

test.serial('before with custom headers value', async t => {
  const body = { foo: 'bar', doo: 1 };
  const exp = JSON.stringify(body);
  const url = `${BASE}/jsonbefore2`;
  const headerContent = 'application/json;charset=utf-8';
  const headerAccept = 'application/json;charset=utf-8';
  const fm = fetchMock.once(
    (u, o) => u === url && (o as RequestInit).body === exp,
    {},
    {
      name: 'jsonbefore2',
      method: 'POST',
      headers: {
        'Content-Type': headerContent,
        Accept: headerAccept,
      },
    },
  );
  const int = before({ headerAccept, headerContent });
  const frest = getInstance({ interceptors: { before: [int] } });

  const res = await frest.post('jsonbefore2', { body });
  t.true(res.origin.ok);
  t.true(fm.called(url));
});
