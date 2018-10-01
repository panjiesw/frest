import plugin from '@start/plugin';

/**
 * Generate TS declaration file using `tsc` build mode for `pkg`.
 * @remarks
 * This use `tsc` cli and detects any tsconfig in `pkg` then include
 * them in `build mode`.
 *
 * @param {string|string[]} pkg
 * @param {{watch?: boolean}} [opts={}]
 */
export const tsd = (pkg, opts = {}) =>
  plugin('tsd', async () => {
    const { resolve } = await import('path');
    const { existsSync } = await import('fs');
    const { default: execa } = await import('execa');

    const tsc = resolve('node_modules', '.bin', 'tsc');
    const args = ['-b', '-v'];
    if (opts.watch) {
      args.push('-w', '--preserveWatchOutput');
    }

    if (Array.isArray(pkg)) {
      for (let i = 0; i < pkg.length; i++) {
        const p = pkg[i];
        args.push(p);
        if (existsSync(resolve(p, 'tsconfig.cjs.json'))) {
          args.push(`${p}/tsconfig.cjs.json`);
        }
      }
    } else {
      args.push(pkg);
      if (existsSync(resolve(pkg, 'tsconfig.cjs.json'))) {
        args.push(`${pkg}/tsconfig.cjs.json`);
      }
    }

    const spawnOptions = {
      stdout: process.stdout,
      stderr: process.stderr,
      stripEof: false,
      env: {
        FORCE_COLOR: '1',
      },
    };

    await execa(tsc, args, spawnOptions);
  });

export const rollup = (config = {}) =>
  plugin('rollup', async () => {
    const { rollup } = await import('rollup');

    const bundle = await rollup(config);

    await bundle.write(config.output);
  });
