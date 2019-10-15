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

import fetchMock from 'fetch-mock';
import frest, { Frest, ConfigMergeType } from '../../';

export const BASE = 'http://localhost';

export interface Fixture {
  instance: Frest;
  fm: typeof fetchMock;
  url: string;
  path: string;
}

export function instances(conf?: ConfigMergeType): Fixture {
  (fetchMock as any).config.fetch = fetch;
  const fm: any = (fetchMock as any).sandbox();
  const instance = frest.create({
    base: BASE,
    fetch: fm,
  });
  if (conf) {
    instance.mergeConfig(conf);
  }
  const path = randomStr();
  const url = `${BASE}/${path}`;
  return { instance, fm, url, path };
}

export const randomStr = (len = 6) =>
  Array(len)
    .fill(0)
    .map(() => Math.random().toString(36)[3])
    .join('');
