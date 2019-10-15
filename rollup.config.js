import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import fileSize from 'rollup-plugin-filesize';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

const frestPkg = require('./package.json');

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const external = id =>
  !id.startsWith('\0') && !id.startsWith('.') && !id.startsWith('/');
const resolveConfig = {
  only: [/^\.{0,2}\//],
  extensions,
};
const babelConfig = {
  // externalHelpers: true,
  // runtimeHelpers: true,
  exclude: ['node_modules/**'],
  extensions,
};

// common config
const common = {
  external,
  plugins: [resolve(resolveConfig), babel(babelConfig)],
};

const frest = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/frest.esm.js',
      format: 'esm',
    },
    {
      file: 'dist/frest.cjs.js',
      format: 'cjs',
    },
  ],
  ...common,
};

const frestTS = {
  input: 'lib/index.d.ts',
  output: [{ file: "dist/frest.d.ts", format: "esm" }],
  plugins: [dts()],
}

const frestUMD = {
  input: 'src/umd.ts',
  output: {
    sourcemap: true,
    file: 'dist/frest.min.js',
    format: 'iife',
    name: '__frest__',
    banner:
`
/*!
 * frest ${frestPkg.version} - https://github.com/panjiesw/frest
 * Copyright(c) Panjie Setiawan Wicaksono.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
`,
  },
  plugins: [
    resolve({
      extensions,
    }),
    commonjs({
      include: /node_modules/,
    }),
    babel(babelConfig),
    terser({
      output: {
        comments: /^\**!|@preserve|@license|@cc_on/i,
      },
    }),
    fileSize(),
  ],
}

export default [frest, frestTS, frestUMD];
