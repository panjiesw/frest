// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
  IFrestConfig,
  IFrestError,
  IFrestRequestConfig,
  IWrappedFrestResponse,
} from './interface';

export class FrestError extends Error implements IFrestError {
  constructor(
    message: string,
    public config: IFrestConfig,
    public request: IFrestRequestConfig,
    public response?: IWrappedFrestResponse<any>,
  ) {
    super(message);
  }
}
