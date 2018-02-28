import { IConfig, Frest } from '../../';

export const BASE = 'http://localhost';

export function getInstance(conf?: Partial<IConfig>): Frest {
  const frest = new Frest({
    base: BASE,
    fetch,
  });
  if (conf) {
    frest.mergeConfig(conf);
  }
  return frest;
}
