// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  IAfterResponseInterceptorArg,
  IAfterResponseInterceptor,
  IWrappedResponse,
} from 'frest';
import { ID_AFTER } from './ids';

export interface IJSONAfterResponseOption {
  force?: boolean;
}

const after: (
  options?: IJSONAfterResponseOption,
) => IAfterResponseInterceptor = (options: IJSONAfterResponseOption = {}) => {
  const interceptor: IAfterResponseInterceptor = (
    input: IAfterResponseInterceptorArg,
  ) =>
    new Promise<IWrappedResponse<any>>((resolve, reject) => {
      const { origin, value: originValue } = input.wrappedResponse;
      const { headers, bodyUsed, status } = origin;
      const ct = headers.get('Content-Type');
      if (!bodyUsed) {
        if ((ct && ct.indexOf('application/json') >= 0) || options.force) {
          origin
            .json()
            .then(value => {
              resolve({ origin, value });
            })
            .catch(err => {
              if (status >= 201 && status <= 204) {
                resolve({ origin, value: null });
              } else {
                reject(err);
              }
            });
          return;
        }
      }
      resolve({ origin, value: originValue });
    });

  Object.defineProperty(interceptor, 'id', { value: ID_AFTER });
  return interceptor;
};

export { after };
