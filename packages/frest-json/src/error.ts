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

import * as f from 'frest';
import * as t from './types';
import { ID_ERROR } from './ids';

export default function errorInterceptor(
  opts: t.IJSONErrorInterceptorOption = {},
): f.IErrorInterceptor {
  const jsonErrorInterceptor: f.IErrorInterceptor = err =>
    new Promise<f.IResponse | undefined | null>((resolve, reject) => {
      const { headerContent } = opts;
      const { response, request } = err;
      const { skip } = request;
      if (response) {
        const { headers, bodyUsed } = response.origin;
        const ct = headers.get('Content-Type');
        if (
          ct &&
          ct.indexOf(headerContent || 'application/json') >= 0 &&
          (!skip || skip.indexOf(ID_ERROR) < 0) &&
          !bodyUsed
        ) {
          response.origin.json().then(body => {
            response.body = body;
            err.response = response;
            reject(err);
          });
          return;
        }
      }
      resolve(null);
    });

  Object.defineProperty(jsonErrorInterceptor, 'id', { value: ID_ERROR });
  return jsonErrorInterceptor;
}
