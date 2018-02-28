import test from 'ava';
import { Frest, IConfig } from '../../';
import { FREST_DEFAULT_CONFIG } from '../../Frest';
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
    ...FREST_DEFAULT_CONFIG,
    ...changed,
    base: BASE,
  };

  const frest = new Frest(config);
  frest.mergeConfig(changed);
  t.deepEqual(frest.config, expected);
});
