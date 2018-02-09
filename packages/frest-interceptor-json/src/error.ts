// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { IErrorInterceptor, IFrestError, WrappedFrestResponse } from 'frest';
import { ID_ERROR } from './ids';

const error: () => IErrorInterceptor = () => {
  const interceptor: IErrorInterceptor = (err: IFrestError) =>
    new Promise<WrappedFrestResponse<any> | null>((resolve, reject) => {
      const { response } = err;
      if (response) {
        const { headers, bodyUsed } = response.origin;
        const ct = headers.get('Content-Type');
        if (ct && ct.indexOf('application/json') >= 0 && !bodyUsed) {
          response.origin.json().then(value => {
            response.value = value;
            err.response = response;
            reject(err);
          });
          return;
        }
      }
      resolve(null);
    });

  Object.defineProperty(interceptor, 'id', { value: ID_ERROR });
  return interceptor;
};

export { error };
