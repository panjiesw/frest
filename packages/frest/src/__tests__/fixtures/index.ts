import { IFrestConfig, Frest } from '../../';

export const BASE = 'http://localhost';

export function getInstance(conf?: Partial<IFrestConfig>): Frest {
  const frest = new Frest({
    base: BASE,
    fetch,
  });
  if (conf) {
    frest.mergeConfig(conf);
  }
  return frest;
}
