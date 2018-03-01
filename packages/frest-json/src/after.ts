// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { IAfterInterceptor, IResponse } from 'frest';
import { ID_AFTER } from './ids';

export interface IJSONAfterOption {
  force?: boolean;
  headerContent?: string;
}

const after = (opts: IJSONAfterOption = {}): IAfterInterceptor => {
  const { force, headerContent } = opts;
  const interceptor: IAfterInterceptor = input =>
    new Promise<IResponse<any>>((resolve, reject) => {
      const { origin, body: originBody } = input.response;
      const { headers, bodyUsed, status } = origin;
      const ct = headers.get('Content-Type');
      if (
        !bodyUsed &&
        ((ct && ct.indexOf(headerContent || 'application/json') >= 0) || force)
      ) {
        origin
          .json()
          .then(body => {
            resolve({ origin, body });
          })
          .catch(err => {
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

  Object.defineProperty(interceptor, 'id', { value: ID_AFTER });
  return interceptor;
};

export { after };
