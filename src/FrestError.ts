/**
 * @module frest
 */

import { FrestRequest, FrestResponse, FrestErrorType } from './types';
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
    request: FrestRequest,
    response?: FrestResponse<any>,
  ): FrestError;
}

/**
 * Error representation class when there is any failure during request life-cycle.
 * @public
 */
export class FrestError extends Error implements FrestErrorType {
  /* istanbul ignore next */
  constructor(
    message: string,
    public frest: Frest,
    public request: FrestRequest,
    public response?: FrestResponse<any>,
  ) {
    super(message);
  }
}
