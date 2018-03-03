/**
 * Copyright (c) 2018 Panjie Setiawan Wicaksono
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import * as f from 'frest';
import { ID_ERROR } from './ids';

export type RetryConditionFn = (
  frest: f.IFrest,
  request: f.IRequest,
  response: f.IResponse,
) => boolean;

export type RetryFn = (
  frest: f.IFrest,
  request: f.IRequest,
  response: f.IResponse,
) => Promise<f.IResponse>;

export interface IRetry {
  count?: number;
  delay?: number;
  exp?: number;
  condition?: RetryConditionFn;
  doRetry?: RetryFn;
}

export interface IAuthErrorOption {
  count?: number;
  delay?: number;
  exp?: number;
  condition?: RetryConditionFn;
  doRetry?: RetryFn;
}

const error = (opts: IAuthErrorOption): f.IErrorInterceptor => {
  const defaultCondition: RetryConditionFn = (_, req, res) =>
    req.action !== 'login' && res.origin.status === 401;

  const authErrorInterceptor: f.IErrorInterceptor = err =>
    new Promise<f.IResponse | null>((resolve, reject) => {
      const {
        count = 0,
        delay = 1000,
        exp = 1,
        condition = defaultCondition,
        doRetry,
      } = opts;
      const { frest, request, response } = err;
      const { skip } = request;

      if (
        response &&
        (!skip || skip.indexOf(ID_ERROR) < 0) &&
        count > 0 &&
        condition(frest, request, response) &&
        doRetry
      ) {
        if (request.retry == null) {
          request.retry = 0;
        } else if (request.retry >= count) {
          resolve(null);
          return;
        }
        setTimeout(() => {
          doRetry(frest, request, response)
            .then(resolve)
            .catch(reject);
        }, ++request.retry * delay * exp);
      }
      resolve(null);
    });

  Object.defineProperty(authErrorInterceptor, 'id', { value: ID_ERROR });
  return authErrorInterceptor;
};

export { error };
