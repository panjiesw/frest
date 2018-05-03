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

import { IErrorInterceptor, IResponse } from 'frest';
import { IJSONErrorInterceptorOption } from './types';
import { ID_ERROR } from './ids';

/**
 * Create a JSON error interceptor.
 *
 * @remarks
 * In Frest, any kind of error, including non-OK HTTP status, during request
 * life-cycle will be thrown. This interceptor will try to parse response body
 * in case the request is completed but with non-OK HTTP status **AND** it
 * specifies the `Content-Type` header is compatible with `application/json`
 * or the one specified in the options.
 *
 * @param opts - Options for this error interceptor.
 *
 * @returns JSON error interceptor function
 */
export default function errorInterceptor(
  opts: IJSONErrorInterceptorOption = {},
): IErrorInterceptor {
  const jsonErrorInterceptor: IErrorInterceptor = err =>
    new Promise<IResponse | undefined | null>((resolve, reject) => {
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
