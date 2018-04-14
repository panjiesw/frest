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

import * as t from 'frest';
import { ID_BEFORE } from './ids';

export interface IJSONBeforeOption {
  headerContent?: string;
  headerAccept?: string;
  method?: t.HttpMethod[];
}

const before = (opts: IJSONBeforeOption = {}): t.IBeforeInterceptor => {
  const jsonBeforeInterceptor: t.IBeforeInterceptor = input =>
    new Promise<t.IRequest>((resolve, reject) => {
      try {
        const { headerAccept, headerContent, method } = opts;
        const { body: origin, method: meth, headers, skip } = input.request;
        let body = input.request.body;
        if (
          typeof origin === 'object' &&
          !(origin instanceof FormData) &&
          !(origin instanceof ArrayBuffer) &&
          (!method || method.indexOf(meth) > -1) &&
          (!skip || skip.indexOf(ID_BEFORE) < 0)
        ) {
          body = JSON.stringify(origin);
          headers.set('Content-Type', headerContent || 'application/json');
          headers.set('Accept', headerAccept || 'application/json');
        }
        resolve({ ...input.request, headers, body });
      } catch (e) {
        reject(e);
      }
    });

  Object.defineProperty(jsonBeforeInterceptor, 'id', { value: ID_BEFORE });
  return jsonBeforeInterceptor;
};

export { before };
