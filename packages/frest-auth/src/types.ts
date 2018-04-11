/**
 * Copyright (c) 2018 Panjie Setiawan Wicaksono
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export type AuthAttach = 'header' | 'query' | 'cookie';

export interface IAuthScheme {
  name?: string;
  attach?: AuthAttach;
  token?: () => string;
  prefix?: string;
}
