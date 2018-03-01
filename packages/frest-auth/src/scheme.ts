/**
 * Copyright (c) 2018 Panjie Setiawan Wicaksono
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import * as t from './types';

export const basicAuth = (token: () => string): t.IAuthScheme => ({
  name: 'Authorization',
  attach: 'header',
  prefix: 'Basic ',
  token,
});

export const bearerAuth = (token: () => string): t.IAuthScheme => ({
  name: 'Authorization',
  attach: 'header',
  prefix: 'Bearer ',
  token,
});
