---
title: "Introduction"
---

# Frest JavaScript REST Client

![frest](/img/logo-128.png)

{{% notice warning %}}
Documentation in progress! Keep track at the [pull request link](https://github.com/panjiesw/frest/pull/1)
{{% /notice %}}

## Installation

To install the core Frest package

```bash
# using npm. -P is alias of --save-prod in NPM 5.x. Alternatively use --save
npm i -P frest
# using yarn
yarn add frest
```

Or include the UMD build directly in a script tag

```html
<script type="text/javascript" src="https://unpkg.com/frest"></script>
```

To install official interceptors

```bash
yarn add frest-json frest-auth
```

{{% notice warning %}}
TODO: More on interceptors
{{% /notice %}}

## Introduction

[Frest](https://github.com/panjiesw/frest.git) is a Browser REST client wrapper of [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) with XHR fallback and interceptor support.

### Features

- HTTP methods shortcut and CRUD aliases
- XMLHttpRequest fallback, for file download/upload (with progress event) and when Fetch API is not available
- Interceptors to manipulate request/response/error:
  - Before request, add additional config for all/some operation before firing the request
  - After response, transform response before returning for all/some operation
  - Error, catch all error / request retry possibility
- Include UMD build for direct usage in html script tag
- Include TypeScript definition
