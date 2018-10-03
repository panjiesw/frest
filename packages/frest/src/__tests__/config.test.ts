import frest, { DEFAULT_CONFIG, ConfigMergeType } from '../';
import { BASE, instances } from './__fixtures__';

describe('Config', () => {
  it('merges default', () => {
    const config: ConfigMergeType = {
      base: BASE,
      method: 'POST',
    };
    const changed: ConfigMergeType = {
      credentials: 'include',
      method: 'GET',
    };
    const expected = {
      ...DEFAULT_CONFIG,
      ...changed,
      base: BASE,
    };

    const instance = frest.create(config);
    instance.mergeConfig(changed);

    expect(instance.config).toEqual(expected);
  });

  it('uses custom fetch function', () => {
    const { instance, fm } = instances();

    expect(instance.fetchFn).toBe(fm);
  });
});
