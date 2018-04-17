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

export interface IJSONRequestInterceptorOption {
  headerContent?: string;
  headerAccept?: string;
  method?: t.HttpMethod[];
}

export type IJSONTransformFn = (response: Response) => Promise<string>;

export interface IJSONResponseInterceptorOption {
  force?: boolean;
  headerContent?: string;
  transform?: IJSONTransformFn;
}

export interface IJSONErrorInterceptorOption {
  headerContent?: string;
}

export interface IJSONInterceptorsOptions {
  error?: IJSONErrorInterceptorOption;
  request?: IJSONRequestInterceptorOption;
  response?: IJSONResponseInterceptorOption;
}
