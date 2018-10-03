import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import fileSize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';

const frestPkg = require('../../packages/frest/package.json');

export const frest = {
  input: 'packages/frest/esm/umd.js',
  output: {
    sourcemap: true,
    file: 'packages/frest/dist/frest.min.js',
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
    nodeResolve({
      jsnext: true,
    }),
    commonjs({
      include: /node_modules/,
    }),
    terser({
      output: {
        comments: /^\**!|@preserve|@license|@cc_on/i,
      },
    }),
    fileSize(),
  ],
};
