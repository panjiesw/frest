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
export * from './FrestError';
export * from './Frest';
export { utils, xhrFetch };
