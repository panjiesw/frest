/**
 * Copyright (c) 2018 Panjie Setiawan Wicaksono
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import * as f from 'frest';
import * as t from './types';
import { ID_BEFORE } from './ids';

const before = (scheme: t.IAuthScheme): f.IBeforeInterceptor => {
  const { attach, name: _name, prefix: _prefix, token: tokenFn } = scheme;
  const name = _name || 'Authorization';
  const prefix = _prefix || '';
  const authBeforeInterceptor: f.IBeforeInterceptor = input =>
    new Promise<f.IRequest>(resolve => {
      const token = `${prefix}${tokenFn()}`;
      const { headers, skip } = input.request;
      let { query } = input.request;
      if (!skip || skip.indexOf(ID_BEFORE) < 0) {
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
      }
      resolve({ ...input.request, headers, query });
    });

  Object.defineProperty(authBeforeInterceptor, 'id', { value: ID_BEFORE });
  return authBeforeInterceptor;
};

export { before };
