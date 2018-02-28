// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { IAfterResponseInterceptor, IWrappedResponse } from 'frest';
import { ID_AFTER } from './ids';

export interface IJSONAfterOption {
  force?: boolean;
  headerContent?: string;
}

const after = (opts: IJSONAfterOption = {}): IAfterResponseInterceptor => {
  const { force, headerContent } = opts;
  const interceptor: IAfterResponseInterceptor = input =>
    new Promise<IWrappedResponse<any>>((resolve, reject) => {
      const { origin, value: originValue } = input.wrappedResponse;
      const { headers, bodyUsed, status } = origin;
      const ct = headers.get('Content-Type');
      if (
        !bodyUsed &&
        ((ct && ct.indexOf(headerContent || 'application/json') >= 0) || force)
      ) {
        origin
          .json()
          .then(value => {
            resolve({ origin, value });
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
      resolve({ origin, value: originValue });
    });

  Object.defineProperty(interceptor, 'id', { value: ID_AFTER });
  return interceptor;
};

export { after };
