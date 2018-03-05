// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as f from 'frest';
import { ID_AFTER } from './ids';

export type IJSONTransformFn = (response: Response) => Promise<string>;

export interface IJSONAfterOption {
  force?: boolean;
  headerContent?: string;
  transform?: IJSONTransformFn;
}

const after = (opts: IJSONAfterOption = {}): f.IAfterInterceptor => {
  const jsonAfterInterceptor: f.IAfterInterceptor = input =>
    new Promise<f.IResponse<any>>((resolve, reject) => {
      const { force, headerContent, transform } = opts;
      const { skip } = input.request;
      const { origin, body: originBody } = input.response;
      const { headers, bodyUsed, status } = origin;
      const ct = headers.get('Content-Type');
      if (
        !bodyUsed &&
        (!skip || skip.indexOf(ID_AFTER) < 0) &&
        ((ct && ct.indexOf(headerContent || 'application/json') >= 0) || force)
      ) {
        let promise: Promise<any>;
        if (transform) {
          promise = transform(origin)
            .then(text => JSON.parse(text))
            .then(body => {
              resolve({ origin, body });
            });
        } else {
          promise = origin.json().then(body => {
            resolve({ origin, body });
          });
        }

        promise.catch(err => {
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
