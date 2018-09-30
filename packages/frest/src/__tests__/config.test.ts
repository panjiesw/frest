import frest, { IConfig } from '../';
import { BASE, instances } from './__fixtures__';

describe('Config', () => {
  test('merge', () => {
    const config: Partial<IConfig> = {
      base: BASE,
      method: 'POST',
    };
    const changed: Partial<IConfig> = {
      credentials: 'include',
      method: 'GET',
    };
    const expected = {
      ...frest.defaults,
      ...changed,
      base: BASE,
    };

    const instance = frest.create(config);
    instance.mergeConfig(changed);

    expect(instance.config).toEqual(expected);
  });

  test('fetch function', () => {
    const { instance, fm } = instances();

    expect(instance.fetchFn).toBe(fm);
  });
});
