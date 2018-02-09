// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// tslint:disable-next-line:no-unused-variable
import {
  IAfterResponseInterceptor,
  IBeforeRequestInterceptor,
  IErrorInterceptor,
} from 'frest';

import { after, IJSONAfterResponseOption } from './after';
import { before } from './before';
import { error } from './error';
import { ID_AFTER, ID_BEFORE, ID_ERROR } from './ids';

export {
  IJSONAfterResponseOption,
  after,
  before,
  error,
  ID_AFTER,
  ID_BEFORE,
  ID_ERROR,
};
