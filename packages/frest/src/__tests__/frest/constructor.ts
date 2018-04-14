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
import { Frest, IConfig } from '../../';
import { DEFAULT_CONFIG } from '../../Frest';
import { BASE } from '../fixtures';

test('constructor no arg default config', t => {
  const frest = new Frest();
  t.deepEqual(frest.config, DEFAULT_CONFIG, 'must be equal the default config');
});

test('constructor string arg become base', t => {
  const frest = new Frest(BASE);
  const expected = {
    ...DEFAULT_CONFIG,
    base: BASE,
  };
  t.deepEqual(frest.config, expected, 'must have the same base');
  t.is(frest.base, BASE);
});

test('constructor merge config', t => {
  const config: Partial<IConfig> = {
    base: BASE,
    method: 'POST',
  };
  const expected = {
    ...DEFAULT_CONFIG,
    ...config,
  };
  const frest = new Frest(config);
  t.deepEqual(frest.config, expected, 'must have the merged config');
});
