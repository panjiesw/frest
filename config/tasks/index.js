import codecov from '@start/plugin-lib-codecov';
import env from '@start/plugin-env';
import find from '@start/plugin-find';
import parallel from '@start/plugin-parallel';
import read from '@start/plugin-read';
import remove from '@start/plugin-remove';
import sequence from '@start/plugin-sequence';
import watch from '@start/plugin-watch';
import write from '@start/plugin-write';
import xargs from '@start/plugin-xargs';
import { tsd, rollup } from './plugins';
import * as rollupConfigs from './rollup.config';

const allPackages = ['frest'];
const filePatterns = pkg => [
  `packages/${pkg}/src/**/*.ts`,
  `!**/*.d.ts`,
  `!**/__mocks__/**`,
  '!**/__tests__/**',
];

export const compile = (...pkg) => {
  if (pkg.length === 1 && pkg[0] === 'all') {
    return tsd(allPackages.map(p => `packages/${p}`));
  }
  return tsd(pkg.map(p => `packages/${p}`));
};

export const cleanRoot = () =>
  sequence(
    find('./coverage'),
    remove,
    find(`./node_modules/.cache/esm`),
    remove,
  );

export const clean = pkg => {
  if (pkg === 'all') {
    return sequence(xclean(...allPackages));
  }
  return sequence(
    find(`packages/${pkg}/{cjs,esm,lib,dist,coverage}`),
    remove,
    find(`packages/${pkg}/node_modules/.cache`),
    remove,
  );
};

export const xclean = (...pkg) => xargs('clean')(...pkg);

export const build = pkg => {
  const tasks = [
    env({ NODE_ENV: 'production' }),
    clean(pkg),
    compile(pkg),
    find(`packages/${pkg}/{cjs,esm}/**/__tests__`),
    remove,
  ];
  if (pkg === 'frest') {
    tasks.push(bundle(pkg));
  }
  return sequence(...tasks);
};

export const bundle = pkg => rollup(rollupConfigs[pkg]);

export const cov = () => sequence(find('coverage/lcov.info'), read, codecov);
