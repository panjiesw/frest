/**
 * @module frest
 */
/**
 *    Copyright 2018 Panjie Setiawan Wicaksono
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import { IRequest, IResponse, IFrestError } from './types';
import Frest from './Frest';

export interface FrestErrorConstructor {
  new (
    message: string,
    frest: Frest,
    request: IRequest,
    response?: IResponse<any>,
  ): FrestError;
}

export default class FrestError extends Error implements IFrestError {
  constructor(
    message: string,
    public frest: Frest,
    public request: IRequest,
    public response?: IResponse<any>,
  ) {
    super(message);
  }
}
