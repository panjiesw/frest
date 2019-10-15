/**
 * @module frest
 */

import { IRequest, IResponse, IFrestError } from './types';
import { Frest } from './Frest';

/**
 * FrestError constructor/class signature.
 * @remarks
 * This is only used for UMD build.
 * @public
 */
export interface FrestErrorConstructor {
  new (
    message: string,
    frest: Frest,
    request: IRequest,
    response?: IResponse<any>,
  ): FrestError;
}

/**
 * Error representation class when there is any failure during request life-cycle.
 * @public
 */
export class FrestError extends Error implements IFrestError {
  /* istanbul ignore next */
  constructor(
    message: string,
    public frest: Frest,
    public request: IRequest,
    public response?: IResponse<any>,
  ) {
    super(message);
  }
}