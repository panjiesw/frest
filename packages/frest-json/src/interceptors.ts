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

import { IInterceptors } from 'frest';
import { IJSONInterceptorsOptions } from './types';
import errorInterceptor from './error';
import requestInterceptor from './request';
import responseInterceptor from './response';

/**
 * Create JSON interceptors set.
 *
 * @remarks
 * Specify an option for each type of interceptor to enable them. Unspecified
 * option will make the interceptor not created.
 *
 * @param opts - Options for each type of JSON interceptors.
 */
export default function jsonInterceptors(
  opts: IJSONInterceptorsOptions = {},
): IInterceptors {
  return {
    error: opts.error ? errorInterceptor(opts.error) : undefined,
    request: opts.request ? requestInterceptor(opts.request) : undefined,
    response: opts.response ? responseInterceptor(opts.response) : undefined,
  };
}