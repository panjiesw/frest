// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as t from './types';

export class FrestError extends Error implements t.IFrestError {
  constructor(
    message: string,
    public frest: t.IFrest,
    public request: t.IRequest,
    public response?: t.IResponse<any>,
  ) {
    super(message);
  }
}
