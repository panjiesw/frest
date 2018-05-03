/**
 * @module frest-json
 */
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

import { IResponseInterceptor, IResponse } from 'frest';
import { IJSONResponseInterceptorOption } from './types';
import { ID_RESPONSE } from './ids';

/**
 * Create a JSON response interceptor.
 *
 * @remarks
 * This interceptor will try to parse response's body if the response's
 * `Content-Type` header is compatible with the one provided in
 * {@link IJSONResponseInterceptorOption.headerContent} option.
 * If {@link IJSONResponseInterceptorOption.transform} is provided, it'll
 * call the function before parsing it.
 *
 * @param opts - Options for this response interceptor
 *
 * @returns JSON response interceptor
 */
export default function responseInterceptor(
  opts: IJSONResponseInterceptorOption = {},
): IResponseInterceptor {
  const jsonResponseInterceptor: IResponseInterceptor = input =>
    new Promise<IResponse<any>>((resolve, reject) => {
      const { force, headerContent, transform } = opts;
      const { skip } = input.request;
      const { origin, body: originBody } = input.response;
      const { headers, bodyUsed, status } = origin;
      const ct = headers.get('Content-Type');
      if (
        !bodyUsed &&
        (!skip || skip.indexOf(ID_RESPONSE) < 0) &&
        ((ct && ct.indexOf(headerContent || 'application/json') >= 0) || force)
      ) {
        let promise: Promise<any>;
        if (transform) {
          promise = transform(origin)
            .then(text => JSON.parse(text))
            .then(body => {
              resolve({ origin, body });
            });
        } else {
          promise = origin.json().then(body => {
            resolve({ origin, body });
          });
        }

        // If the HTTP status is 201-204, assume it's empty intentionally
        // and just resolve the origin, or reject it otherwise.
        promise.catch(err => {
          if (status >= 201 && status <= 204) {
            resolve({ origin });
          } else {
            reject(err);
          }
        });
        return;
      }
      resolve({ origin, body: originBody });
    });

  Object.defineProperty(jsonResponseInterceptor, 'id', { value: ID_RESPONSE });
  return jsonResponseInterceptor;
}
