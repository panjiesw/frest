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
import { ID_BEFORE } from './ids';

const attachAuth = (req: f.IRequest, scheme: t.IAuthScheme, token: string) => {
  const { attach, name: _name } = scheme;
  const name = _name || 'Authorization';
  const { headers } = req;
  let { query } = req;
  if (attach === 'header') {
    headers.set(name, token);
  } else {
    query =
      typeof query === 'object'
        ? { ...query, [name]: token }
        : query == null || query === ''
          ? `${name}=${token}`
          : `${query}&${name}=${token}`;
  }
  return { ...req, headers, query };
};

const getToken = (scheme: t.IAuthScheme) => {
  const { prefix: _prefix, token: tokenFn } = scheme;
  const prefix = _prefix || '';
  if (tokenFn) {
    const token = tokenFn();
    if (token != null) {
      return `${prefix}${token}`;
    }
  }
  return null;
};

const before = (scheme: t.IAuthScheme): f.IBeforeInterceptor => {
  const authBeforeInterceptor: f.IBeforeInterceptor = input =>
    new Promise<f.IRequest>(resolve => {
      const token = getToken(scheme);
      let { request } = input;
      const { credentials } = request;
      if (token == null) {
        // Either the tokenFn return null or it's using 'cookie' scheme
        if (process.env.NODE_ENV !== 'production') {
          if (scheme.name !== 'cookie') {
            // tslint:disable-next-line:no-console
            console.warn('frest-auth: no token provided, not attaching auth');
          } else if (!credentials || credentials === 'omit') {
            // tslint:disable-next-line:no-console
            console.warn(
              'frest-auth: no credentials is included, not sending cookies',
            );
          }
        }
        resolve(request);
        return;
      }
      const { skip } = request;
      if (!skip || skip.indexOf(ID_BEFORE) < 0) {
        request = attachAuth(request, scheme, token);
      }
      resolve(request);
    });

  Object.defineProperty(authBeforeInterceptor, 'id', { value: ID_BEFORE });
  return authBeforeInterceptor;
};

export { before, attachAuth, getToken };
