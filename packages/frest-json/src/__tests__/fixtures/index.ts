import { ConfigMergeType, Frest } from 'frest';

export const BASE = 'http://localhost';

export function getInstance(conf?: ConfigMergeType): Frest {
  const frest = new Frest({
    base: BASE,
    fetch,
  });
  if (conf) {
    frest.mergeConfig(conf);
  }
  return frest;
}
