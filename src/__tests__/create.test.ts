import frest, { DEFAULT_CONFIG, IConfig } from '../';
import { BASE } from './__fixtures__';

describe('Create', () => {
  // test('Default instance', () => {
  //   expect(frest.config).toEqual(DEFAULT_CONFIG);
  // });

  it('has correct config', () => {
    expect(frest.create().config).toEqual(frest.config);
  });

  describe('arg is string', () => {
    it('has correct config', () => {
      const instance = frest.create(BASE);
      const expected = {
        ...DEFAULT_CONFIG,
        base: BASE,
      };
      expect(instance.config).toEqual(expected);
      expect(instance.base).toBe(BASE);
    });
  });

  describe('arg is config object', () => {
    it('has correct config', () => {
      const config: Partial<IConfig> = {
        base: BASE,
        method: 'POST',
      };
      const expected = {
        ...DEFAULT_CONFIG,
        ...config,
      };
      const instance = frest.create(config);
      expect(instance.config).toEqual(expected);
    });
  });
});
