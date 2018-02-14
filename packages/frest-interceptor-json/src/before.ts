// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  IBeforeRequestInterceptorArg,
  IBeforeRequestInterceptor,
  IFrestRequestConfig,
} from 'frest';
import assign from 'object-assign';
import { ID_BEFORE } from './ids';

const before: () => IBeforeRequestInterceptor = () => {
  const interceptor: IBeforeRequestInterceptor = (
    input: IBeforeRequestInterceptorArg,
  ) =>
    new Promise<IFrestRequestConfig>((resolve, reject) => {
      try {
        const { body: origin, headers, skip } = input.requestConfig;
        let body = input.requestConfig.body;
        if (
          typeof origin === 'object' &&
          !(origin instanceof FormData) &&
          !(origin instanceof ArrayBuffer) &&
          (!skip || skip.indexOf(ID_BEFORE) < 0)
        ) {
          body = JSON.stringify(origin);
          headers.set('Content-Type', 'application/json');
          headers.set('Accept', 'application/json');
        }
        resolve(assign({}, input.requestConfig, { headers, body }));
      } catch (e) {
        reject(e);
      }
    });

  Object.defineProperty(interceptor, 'id', { value: ID_BEFORE });
  return interceptor;
};

export { before };
