<img src="https://frest.netlify.com/img/logo-256.png" alt="logo" height="120" align="right" />

# Frest

[![Build Status](https://img.shields.io/travis/panjiesw/frest/master.svg?style=flat-square)](https://travis-ci.org/panjiesw/frest) [![codecov](https://img.shields.io/codecov/c/github/panjiesw/frest/master.svg?style=flat-square)](https://codecov.io/gh/panjiesw/frest)

> Browser REST client wrapper of [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) with XHR fallback and interceptor support

[Go to full documentation](https://frest.netlify.com).

## Features

- HTTP methods shortcut and CRUD aliases
- XMLHttpRequest fallback, for file download/upload (with progress event) and when Fetch API is not available
- Interceptors to manipulate request/response/error:
  - Before request, add additional config for all/some operation before firing the request
  - After response, transform response before returning for all/some operation
  - Error, catch all error / request retry possibility
- Include UMD build for direct usage in html script tag
- Include TypeScript definition

## Usage

Install the package using `npm` or `yarn`

```bash
npm install --save frest
# or
yarn add frest
```

Or include the UMD build directly in a script tag

```html
<script type="text/javascript" src="https://unpkg.com/frest"></script>
```

Basic examples.

```typescript
import Frest from 'frest';

// create Frest instance
// in UMD build, Frest and FrestError are included in Window object

// with default config
const api = new Frest('https://api.example.com');

// config extends Fetch's init option
const api = new Frest({
  base: 'https://api.example.com',
  headers: new Headers({
    'X-Foo': 'bar',
  }),
});

// call HTTP method
api
  // request config will override the default config of Frest instance
  .get('foo', { headers: new Headers({ 'X-Foo': 'foo' }) })
  .then(res => {
    // res is an object containing Fetch's response and the body
    console.log('origin', res.origin);
    // by default, without any interceptors, the body is undefined
    console.log('body', res.body);
    if (res.origin.ok) {
      return res.origin.json();
    }
    Promise.reject('uh oh');
  })
  .then(body => {
    console.log('body', body);
  })
  .catch(err => {
    // err is an instance of FrestError
    console.error('err', err);
  });

// available methods
api.post(...) // HTTP POST
api.put(...) // HTTP PUT
api.delete(...) // HTTP DELETE
api.patch(...) // HTTP PATCH
api.option(...) // HTTP OPTION
api.download(...) // Download file, support onDownloadProgress event
api.upload(...) // Upload file, support onUploadProgress event

// Use with async-await style
async function makeRequest() {
  try {
    const res = await api.post('blah');
    if (res.ok) {
      const body = await res.origin.json();
      console.log('body', body);
    }
  } catch (err) {
    console.error('request failed', err);
  }
}
```
