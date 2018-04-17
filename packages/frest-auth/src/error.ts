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
  opts: t.IAuthErrorOption = {},
): f.IErrorInterceptor {
  const defaultCondition: t.RetryConditionFn = (_, __, res) =>
    res.origin.status === 401;
  const defaultRetry: t.RetryFn = (fr, req) => fr.request(req);

  const authErrorInterceptor: f.IErrorInterceptor = err =>
    new Promise<f.IResponse | null>((resolve, reject) => {
      const {
        count = 0,
        delay = 1000,
        exp = 1,
        condition = defaultCondition,
        doRetry = defaultRetry,
      } = opts;
      const { frest, request, response } = err;
      const { skip } = request;

      if (
        response &&
        (!skip || skip.indexOf(ID_ERROR) < 0) &&
        count > 0 &&
        condition(frest, request, response) &&
        doRetry
      ) {
        if (request.retry == null) {
          request.retry = 0;
        }
        if (request.retry >= count) {
          resolve(null);
          return;
        }
        setTimeout(() => {
          doRetry(frest, request, response)
            .then(resolve)
            .catch(reject);
        }, ++request.retry * delay * exp);
        return;
      }
      resolve(null);
    });

  Object.defineProperty(authErrorInterceptor, 'id', { value: ID_ERROR });
  return authErrorInterceptor;
}
