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
    frest: Frest;
  }
}

self.frest = new Frest();
self.Frest = Frest;
self.FrestError = FrestError;
