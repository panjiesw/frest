// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as t from 'frest';
import { ID_BEFORE } from './ids';

export interface IJSONBeforeOption {
  headerContent?: string;
  headerAccept?: string;
  method?: t.HttpMethod[];
}

const before = (opts: IJSONBeforeOption = {}): t.IBeforeInterceptor => {
  const jsonBeforeInterceptor: t.IBeforeInterceptor = input =>
    new Promise<t.IRequest>((resolve, reject) => {
      try {
        const { headerAccept, headerContent, method } = opts;
        const { body: origin, method: meth, headers, skip } = input.request;
        let body = input.request.body;
        if (
          typeof origin === 'object' &&
          !(origin instanceof FormData) &&
          !(origin instanceof ArrayBuffer) &&
          (!method || method.indexOf(meth) > -1) &&
          (!skip || skip.indexOf(ID_BEFORE) < 0)
        ) {
          body = JSON.stringify(origin);
          headers.set('Content-Type', headerContent || 'application/json');
          headers.set('Accept', headerAccept || 'application/json');
        }
        resolve({ ...input.request, headers, body });
      } catch (e) {
        reject(e);
      }
    });

  Object.defineProperty(jsonBeforeInterceptor, 'id', { value: ID_BEFORE });
  return jsonBeforeInterceptor;
};

export { before };
