/**
 * Copyright (c) 2018 Panjie Setiawan Wicaksono
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
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
      if (token == null) {
        // Either the tokenFn return null or it's using 'cookie' scheme
        if (scheme.name !== 'cookie') {
          // tslint:disable-next-line:no-console
          console.warn('frest-auth: no token provided, not attaching auth');
        }
        resolve(input.request);
        return;
      }
      const { skip } = input.request;
      if (!skip || skip.indexOf(ID_BEFORE) < 0) {
        input.request = attachAuth(input.request, scheme, token);
      }
      resolve(input.request);
    });

  Object.defineProperty(authBeforeInterceptor, 'id', { value: ID_BEFORE });
  return authBeforeInterceptor;
};

export { before, attachAuth, getToken };
