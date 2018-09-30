import frest, { IConfig } from '../';
import { BASE } from './__fixtures__';

describe('Create', () => {
  // test('Default instance', () => {
  //   expect(frest.config).toEqual(frest.defaults);
  // });

  test('no arg', () => {
    expect(frest.create().config).toEqual(frest.config);
  });

  test('string arg', () => {
    const instance = frest.create(BASE);
    const expected = {
      ...frest.defaults,
      base: BASE,
    };
    expect(instance.config).toEqual(expected);
    expect(instance.base).toBe(BASE);
  });

  test('config arg', () => {
    const config: Partial<IConfig> = {
      base: BASE,
      method: 'POST',
    };
    const expected = {
      ...frest.defaults,
      ...config,
    };
    const instance = frest.create(config);
    expect(instance.config).toEqual(expected);
  });
});
