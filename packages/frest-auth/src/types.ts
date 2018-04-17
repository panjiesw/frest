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

export type AuthAttach = 'header' | 'query' | 'cookie';

export interface IAuthScheme {
  name?: string;
  attach?: AuthAttach;
  token?: () => string;
  prefix?: string;
}

export type RetryConditionFn = (
  frest: f.IFrest,
  request: f.IRequest,
  response: f.IResponse,
) => boolean;

export type RetryFn = (
  frest: f.IFrest,
  request: f.IRequest,
  response: f.IResponse,
) => Promise<f.IResponse>;

export interface IRetry {
  count?: number;
  delay?: number;
  exp?: number;
  condition?: RetryConditionFn;
  doRetry?: RetryFn;
}

export interface IAuthErrorOption {
  count?: number;
  delay?: number;
  exp?: number;
  condition?: RetryConditionFn;
  doRetry?: RetryFn;
}
