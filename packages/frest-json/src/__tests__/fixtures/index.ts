import fetchMock from 'fetch-mock';
import { ConfigMergeType, Frest } from 'frest';

export const BASE = 'http://localhost';

export interface Fixture {
  frest: Frest;
  fm: typeof fetchMock;
  url: string;
  path: string;
}

export function instances(conf?: ConfigMergeType): Fixture {
  (fetchMock as any).config.fetch = fetch;
  const fm: any = (fetchMock as any).sandbox();
  const frest = new Frest({
    base: BASE,
    fetch: fm,
  });
  if (conf) {
    frest.mergeConfig(conf);
  }
  const path = randomStr();
  const url = `${BASE}/${path}`;
  return { frest, fm, url, path };
}

export const randomStr = () =>
  [...Array(30)].map(() => Math.random().toString(36)[3]).join('');
