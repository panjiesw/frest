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

import isObj from 'is-plain-object';
import { IRequestInterceptor, IRequest } from 'frest';
import { IJSONRequestInterceptorOption } from './types';
import { ID_REQUEST } from './ids';

/**
 * Create a JSON request interceptor.
 *
 * @remarks
 * This interceptor will try to stringify the request's body configuration
 * if it's a **plain JavaScript object** and set the `Content-Type` header
 * to the provided {@link IJSONRequestInterceptorOption.headerContent} option.
 * It'll also append the `Accept` header with
 * the provided {@link IJSONRequestInterceptorOption.headerAccept} option.
 *
 * @param opts - Options for this request interceptor
 *
 * @returns JSON request interceptor
 */
export default function requestInterceptor(
  opts: IJSONRequestInterceptorOption = {},
): IRequestInterceptor {
  const jsonBeforeInterceptor: IRequestInterceptor = input =>
    new Promise<IRequest>((resolve, reject) => {
      try {
        const { headerAccept, headerContent, method } = opts;
        const { body: origin, method: meth, headers, skip } = input.request;
        let body = input.request.body;
        if (
          (!method || method.indexOf(meth) > -1) &&
          (!skip || skip.indexOf(ID_REQUEST) < 0)
        ) {
          if (isObj(origin)) {
            body = JSON.stringify(origin);
            headers.set('Content-Type', headerContent || 'application/json');
          }
          headers.append('Accept', headerAccept || 'application/json');
        }
        resolve({ ...input.request, headers, body });
      } catch (e) {
        reject(e);
      }
    });

  Object.defineProperty(jsonBeforeInterceptor, 'id', { value: ID_REQUEST });
  return jsonBeforeInterceptor;
}
