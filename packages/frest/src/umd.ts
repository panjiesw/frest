/**
 * @module frest
 * @hidden
 */

import { Frest, FrestConstructor } from './Frest';
import { FrestError, FrestErrorConstructor } from './FrestError';

declare global {
  interface Window {
    Frest: FrestConstructor;
    FrestError: FrestErrorConstructor;
  }
}

self.Frest = Frest;
self.FrestError = FrestError;
