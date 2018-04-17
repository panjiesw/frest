---
title: Concept
weight: 5
---

## The Challenge

When dealing with API call using `fetch()` there are often common task to perform
for any or a subset of requests, such as:

- JSON stringify Request or parse Response body.
- Attaching authentication identifiers to the Request.
- Catch common error.
- Retrying the request with exponential back off.

## Interceptor as Solution

In **Frest**, `Interceptor` is a function invoked during the life cycle of a request.
This function, depend on the life cycle it's configured to, can modify/append/replace
the original intended parameters.

There are 3 kind of `Interceptor` in Frest, along with some tasks that suit to put there

- **Request Interceptor** is invoked just **before** the request is sent to an API server.
  - Append common header
  - `JSON.stringify` the body property of Request configuration if it's a plain object
  - Attach auth information
  - Init logging
- **Response Interceptor** is invoked **after** the response came from the server, but before returning it to the caller.
  - `JSON.parse` the body property of Response if the `Content-Type` is compatible with `json`
  - Normalize the Response body
  - Flush logging
- **Error Interceptor** is invoked whenever there is an **error** happened, including **Non OK** HTTP Response status.
  - Giving a context to the error for debugging purpose
  - Logging
  - Retrying the request
