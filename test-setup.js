require('regenerator-runtime/runtime');
const nodeFetch = require('node-fetch');

if (!global.fetch) {
  global.fetch = nodeFetch;
  global.Response = nodeFetch.Response;
  global.Headers = nodeFetch.Headers;
  global.Request = nodeFetch.Request;
}
