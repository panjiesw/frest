/**
 *    Copyright 2018 Panjie Setiawan Wicaksono
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

// @ts-nocheck
const nodeFetch = require('node-fetch');
const formData = require('form-data');
const browserEnv = require('browser-env');

browserEnv([
  'window',
  'document',
  'navigator',
  'btoa',
  'FileReader',
  'Blob',
  'XMLHttpRequest',
]);

if (!global.FormData) {
  global.FormData = formData;
}

if (!global.fetch) {
  global.fetch = nodeFetch;
  global.Response = nodeFetch.Response;
  global.Headers = nodeFetch.Headers;
  global.Request = nodeFetch.Request;
}
