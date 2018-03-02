// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as f from 'frest';
import { ID_AFTER } from './ids';

export interface IJSONAfterOption {
  force?: boolean;
  headerContent?: string;
}

const after = (opts: IJSONAfterOption = {}): f.IAfterInterceptor => {
  const { force, headerContent } = opts;
  const jsonAfterInterceptor: f.IAfterInterceptor = input =>
    new Promise<f.IResponse<any>>((resolve, reject) => {
      const { skip } = input.request;
      const { origin, body: originBody } = input.response;
      const { headers, bodyUsed, status } = origin;
      const ct = headers.get('Content-Type');
      if (
        !bodyUsed &&
        (!skip || skip.indexOf(ID_AFTER) < 0) &&
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

  Object.defineProperty(jsonAfterInterceptor, 'id', { value: ID_AFTER });
  return jsonAfterInterceptor;
};

export { after };
