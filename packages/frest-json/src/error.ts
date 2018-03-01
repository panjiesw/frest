// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as f from 'frest';
import { ID_ERROR } from './ids';

export interface IJSONErrorOption {
  headerContent?: string;
}

const error = (opts: IJSONErrorOption) => {
  const jsonErrorInterceptor: f.IErrorInterceptor = err =>
    new Promise<f.IResponse<any> | null>((resolve, reject) => {
      const { headerContent } = opts;
      const { response } = err;
      if (response) {
        const { headers, bodyUsed } = response.origin;
        const ct = headers.get('Content-Type');
        if (
          ct &&
          ct.indexOf(headerContent || 'application/json') >= 0 &&
          !bodyUsed
        ) {
          response.origin.json().then(body => {
            response.body = body;
            err.response = response;
            reject(err);
          });
          return;
        }
      }
      resolve(null);
    });

  Object.defineProperty(jsonErrorInterceptor, 'id', { value: ID_ERROR });
  return jsonErrorInterceptor;
};

export { error };
