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
