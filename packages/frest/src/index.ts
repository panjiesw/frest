/**
 * @module frest
 * @preferred
 *
 * Main frest module.
 */

import * as utils from './utils';
import { Frest } from './Frest';
import xhr from './xhr';

const xhrFetch = xhr as typeof fetch;

const frest = new Frest();

export default frest;

export * from './types';
export { FrestError, FrestErrorConstructor } from './FrestError';
export { DEFAULT_CONFIG, FrestConstructor } from './Frest';
export { Frest, utils, xhrFetch };
