/**
 * @module frest
 * @preferred
 *
 * Main frest module.
 */

import * as utils from './utils';
import { Frest } from './Frest';

const frest = new Frest();

export default frest;

export * from './types';
export { FrestError, FrestErrorConstructor } from './FrestError';
export { FrestConstructor } from './Frest';
export { Frest, utils };
