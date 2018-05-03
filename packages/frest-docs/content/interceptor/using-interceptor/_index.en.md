---
title: Using Interceptor
weight: 10
---

<!-- TOC -->

- [Creating Interceptor](#creating-interceptor)
  - [Request Interceptor](#request-interceptor)
  - [Response Interceptor](#response-interceptor)
  - [Error Interceptor](#error-interceptor)
- [Add/Remove Interceptor](#addremove-interceptor)
- [Order of Execution](#order-of-execution)

<!-- /TOC -->

## Creating Interceptor

As mentioned earlier interceptors are function. They will be called
with some parameters and can return their modified values.

To better demonstrate it, let's create each type of interceptor as examples.

### Request Interceptor

Suppose we want to create a request interceptor with these requirements

- Set `Content-Type` header to `application/json` value **if** the `body` is a plain `object` and called with `POST` HTTP method.
- Set `Accept` headers as `application/json` for all requests.

```js
const jsonRequestInterceptor = ({ frest, request }) => // 1
  new Promise((resolve, reject) => { // 2
    const { body, headers, method } = request;
    headers.set('Accept', 'application/json'); // 3
    try {
      if (typeof body === 'object' && method === 'POST') {
        const newBody = JSON.stringify(body);
        headers.set('Content-Type', 'application/json'); // 3
        resolve({ ...request, headers, body: newBody }); // 4
        return;
      }
      resolve({..request, headers});
    } catch (e) {
      reject(e);
    }
  });
jsonRequestInterceptor.id = 'json:request';
```

Some important points from above example

1. The request interceptor function will receive **1 object args** with 2 properties:
    - `frest` is the `Frest` instance which call this interceptor
    - `request` is the original request state **before** it enters this interceptor **TODO**
2. The request interceptor **must** return a `Promise`
3. We can modify the request as we need, in this case we're adding some headers
4. `resolve` the Promise with new request configuration. We can also resolve it to the original request, which means there is no modification to the request.

What's the implication if we use this interceptor?

- No need to manually `stringify` request `body` to JSON string in every request
- No need to append necessary headers in every request

### Response Interceptor

Now we'll look at how to create a response interceptor. We'll use the same case around `json` like the request interceptor part.

- Parse response body if the response `Content-Type` is compatible with `application/json`
- But also check before hand whether the `fetch` [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) `bodyUsed` is `false`.

```js
const jsonResponseInterceptor = ({ frest, request, response }) => // 1
  new Promise((resolve, reject) => { // 2
    const { origin, body } = response; // 3
    const { headers, bodyUsed } = origin;
    const contentType = headers.get('Content-Type');
    if (
      !bodyUsed && // 4
      contentType &&
      contentType.indexOf('application/json') >= 0
    ) {
      origin
        .json()
        .then(responseBody => {
          resolve({ origin, body: responseBody }); // 5
        })
        .catch(reject);
      return;
    }
    resolve(response); // 6
  });
jsonResponseInterceptor.id = 'json:response';
```

Some important points from above example

1. The response interceptor function will receive **1 object args** with 3 properties:
    - `frest` same as request interceptor
    - `request` same as request interceptor
    - `response` the **Frest** response
2. Same as request interceptor, response interceptor also **must** return `Promise`.
3. The `response` is an object which contains properties:
    - `origin` the original `fetch` Response instance
    - `body` parsed value of the response body. It's response interceptor which will fill this value.
4. We **must** check the state of body whether it's already drained or not.
5. Resolve the promise with new **Frest** response object. We **must** always include the original `fetch` Response instance as `origin` property. The `body` value is the parsed JSON response.
6. We can also resolve with the original **Frest** response object, which means there is no modification in this interceptor.

What's the implication if we use this interceptor?

- No need to manually parse response in every successful request. The value is now available directly in **Frest** `Response.body`

### Error Interceptor

In **Frest** any non OK response (status outside `2xx`) will result in a thrown error. This is useful so we can have a common place to check for error (instead of checking `ok` property in `fetch` response).

Let's look at how we implement error interceptor. Since we have created
request and response interceptor to deal with JSON data,
we'll also create an interceptor to parse non OK response, if any.
The tasks are

- Parse response body if the response `Content-Type` is compatible with `application/json`

```js
const jsonErrorInterceptor = err => // 1
  new Promise((resolve, reject) => { // 2
    const {frest, request, response} = err; // 3
    if (response) { // 4
      const { headers, bodyUsed } = response.origin;
      const contentType = headers.get('Content-Type');

      if (
        !bodyUsed && // 5
        contentType &&
        contentType.indexOf('application/json') >= 0
      ) {
        response.origin.json().then(body => {
          response.body = body;
          err.response = response;
          reject(err); // 6
        });
        return;
      }
    }
    resolve(); // 7
  })
```

Some important points from above example

1. The error interceptor will receive **1 error arg** which is an instance of `FrestError`
2. As with other interceptor, error interceptor **must** return a `Promise`
3. The `FrestError` instance will have these properties
    - `frest` same as other interceptor
    - `request` same as other interceptor
    - `response` same as response interceptor
4. The `response` property can be `undefined`, if the error happened before the request is sent
5. Same with response interceptor, we have to check `bodyUsed` if we want to parse the response body
6. In error interceptor, the promise must be rejected if we want to modify the error thrown.
7. If we resolve the promise like this, then it means the original error is not modified.

If we want to recover from an error, instead of rejecting the returned promise, we can resolve it with another response. Suppose we want to make another request to retry with different config

```js
...
frest.request(request).then(resolve);
...
```

In above example, `frest` an `request` are the properties of `FrestError`
in the interceptor arg. They refer to the same **Frest** instance
and request config when we make the request. If the retry request is
successful, **Frest** will recover with the resulting response
and the error will not be thrown.

{{% notice tip %}}
Those 3 interceptor type examples above are already implemented in the official `frest-json` package. Check out the documentation of how to use it.
{{% /notice %}}

## Add/Remove Interceptor

We can add/remove interceptors to Frest instance using either
configuration in constructor or calling `add[Type]Interceptor` and
`remove[Type]Interceptor` method.

To add them when creating Frest instance:

```js
const api = new Frest({
  ...otherConfig,
  interceptors: {
    request: [...],
    response: [...],
    error: [...],
  }
});
```

To add/remove them using methods of Frest instance:

```js
const api = new Frest('');
api.addRequestInterceptor(...);
api.addResponseInterceptor(...);
api.addErrorInterceptor(...);

api.removeRequestInterceptor(...);
api.removeResponseInterceptor(...);
api.removeErrorInterceptor(...);

api.addInterceptors({
  request: someRequestInterceptor,
  response: someResponseInterceptor,
  error: someErrorInterceptor,
})
```

By convention, interceptors `should` have a unique identifier, assigned
in the function itself (see above examples of creating interceptors).
So we can also remove an interceptor using its id.

Suppose we want to remove `jsonRequestInterceptor` created in example above, we can do it like so

```js
api.removeRequestInterceptor('json:request');
```

## Order of Execution

As we can see in ways of adding interceptors above, the interceptors are stored as array depending on their type. When there are multiple interceptors with the same type, they'll be executed in the order of when they're added.

```js
const api = new Frest({
  ...otherConfig,
  interceptors: {
    request: [interceptor1, interceptor2],
  }
});

...

api.addRequestInterceptor(interceptor3);
```

In above example, `interceptor1` will be called **first**.
The returned request, if any, from `interceptor1` will be passed down to `interceptor2`. It's the same way with `interceptor3`.

This is why we **must** always check the `bodyUsed` property of `fetch` Response, in the case of response interceptor. The `body` could have been
used/read in other response interceptor, by the time it arrives in our interceptor.
