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
import { interceptors } from '../../';

test('only create defined options', t => {
  const case1 = interceptors();
  t.deepEqual(case1, {
    error: undefined,
    request: undefined,
    response: undefined,
  });

  const case2 = interceptors({ error: {} });
  t.truthy(case2.error);
  t.falsy(case2.request);
  t.falsy(case2.response);

  const case3 = interceptors({ request: {} });
  t.truthy(case3.request);
  t.falsy(case3.error);
  t.falsy(case3.response);

  const case4 = interceptors({ response: {} });
  t.truthy(case4.response);
  t.falsy(case4.request);
  t.falsy(case4.error);
});
