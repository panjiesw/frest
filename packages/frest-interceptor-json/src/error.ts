// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { IErrorInterceptor, IFrestError, IWrappedResponse } from 'frest';
import { ID_ERROR } from './ids';

const error: () => IErrorInterceptor = () => {
  const interceptor: IErrorInterceptor = (err: IFrestError) =>
    new Promise<IWrappedResponse<any> | null>((resolve, reject) => {
      const { wrappedResponse } = err;
      if (wrappedResponse) {
        const { headers, bodyUsed } = wrappedResponse.origin;
        const ct = headers.get('Content-Type');
        if (ct && ct.indexOf('application/json') >= 0 && !bodyUsed) {
          wrappedResponse.origin.json().then(value => {
            wrappedResponse.value = value;
            err.wrappedResponse = wrappedResponse;
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
