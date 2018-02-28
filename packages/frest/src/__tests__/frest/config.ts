import test from 'ava';
import { Frest, IConfig } from '../../';
import { DEFAULT_CONFIG } from '../../Frest';
import { BASE } from '../fixtures';

test('merge', t => {
  const config: Partial<IConfig> = {
    base: BASE,
    method: 'POST',
  };
  const changed: Partial<IConfig> = {
    credentials: 'include',
    method: 'GET',
  };
  const expected = {
    ...DEFAULT_CONFIG,
    ...changed,
    base: BASE,
  };

  const frest = new Frest(config);
  frest.mergeConfig(changed);
  t.deepEqual(frest.config, expected);
});
