---
title: Using Frest
pre: "<b>1. </b>"
weight: 5
---

<!-- TOC -->

- [The Frest Instance](#the-frest-instance)
- [Calling API Endpoint](#calling-api-endpoint)
- [Response Processing](#response-processing)
- [Async Await Style](#async-await-style)
- [Using TypeScript](#using-typescript)

<!-- /TOC -->

After installation, import it your code. The `Frest` class is exported in default namespace

```js
import Frest from 'frest';
```

## The Frest Instance

Now we can create an instance to communicate with an API URL. Suppose we want
to call an API with base URL <https://api.example.com>

```js
const api = new Frest('https://api.example.com');
```

{{% notice tip %}}
If you are using the UMD build through a `script` tag, `Frest` class is available
in global `window` and `self` object.
{{% /notice %}}

We can also configure the instance with some default parameter,
which will be applied to all API call.
In this example, we want all request to append a header `X-Foo` with value `bar`

```js
const api = new Frest({
  base: 'https://api.example.com',
  headers: new Headers({
    'X-Foo': 'bar',
  }),
});
```

{{% notice info %}}
The configuration object generally extends [fetch init parameter](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch).
Refer to [Configuration](/usage/configuration/) page for more information of available properties
{{% /notice %}}

## Calling API Endpoint

With the instance configured, we can now use its methods to call an API endpoint.
With native `fetch` you have to provide `{method: '<HTTP METHOD>'}` to call
endpoint with certain HTTP Method. In `Frest` it's available directly as method
in the instance.

Here we want to call `GET` <https://api.example.com/foo>.

```js
api.get('foo').then(/*Do something with the response*/);
```

{{% notice warning %}}
As with the native Fetch API, Frest also needs `Promise` to be available in the
browser. If there is a browser of your target that doesn't support `Promise`,
you need to include a polyfill before importing Frest, e.g. [es6-promise](https://www.npmjs.com/package/es6-promise).
{{% /notice %}}

Here is other available method of the instance, all correspond to HTTP Method
as the name implies.

```js
api.post(...) // HTTP POST
api.create(...) // alias of api.post
api.read(...) // alias of api.get
api.put(...) // HTTP PUT
api.update(...) // alias of api.put
api.delete(...) // HTTP DELETE
api.destroy(...) // alias of api.delete
api.patch(...) // HTTP PATCH
api.option(...) // HTTP OPTION
api.download(...) // Download file, support onDownloadProgress event
api.upload(...) // Upload file, support onUploadProgress event
```

We can provide specific configuration to each request. It'll be **merged** with
the default configuration we specified in the instance. Here we set the `X-Foo`
header for this specific request with `foo` value.

```js
api
  .get('foo', { headers: new Headers({ 'X-Foo': 'foo' }) })
  .then(/*Do something with the response*/);
```

## Response Processing

When the request is finished, the promise will be completed and we can do
something with the response. <br>
The resolved value is an object of `IResponse` interface, contains `origin`
property which is the original `fetch` [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response),
and the `body` if any. <br>
If there is any error during the request, we can catch it in the chain. The error
is an instance of `FrestError`.

```js
api
  .get('foo', { headers: new Headers({ 'X-Foo': 'foo' }) })
  .then(res => {
    const { origin, body } = res;
    console.log('origin', origin);
    console.log('body', body);
    // We can safely omit the origin.ok check because Frest took care of it.
    // If origin.ok is false, it'll be thrown as an error and caught in the catch block below
    return origin.json();
  })
  .then(body => {
    console.log('body', body);
  })
  .catch(err => {
    console.error('request failed', err);
  });
```

{{% notice info %}}
The `body` property above by default is `undefined`. It's meant for response interceptors
to process and put value in there.<br>
For example, the above task of parsing `application/json` response can be repetitive
and a suitable candidate to put in a response interceptor.<br>
In fact, there is [frest-json](https://www.npmjs.com/package/frest-json),
an official interceptor package of `Frest` that do just that.<br><br>
Find out more about [Interceptor Concept here](/interceptor/concept).
{{% /notice %}}

## Async Await Style

We can also use Frest api calling in [async-await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) fashion.

```js
async function makeRequest() {
  try {
    const {origin} = await api.post('blah');
    if (origin.ok) {
      const body = await origin.json();
      console.log('body', body);
    }
  } catch (err) {
    console.error('request failed', err);
  }
}
```

## Using TypeScript

Frest is developed with [TypeScript](https://www.typescriptlang.org/) and include
its own definition files. We can comfortably import Frest and use the awesomeness
of TypeScript altogether :)
