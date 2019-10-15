/**
 * @module frest
 * @hidden
 */

import { IRequest } from './types';

// These were taken from somewhere, made by someone.
// I adopted it to frest but forgot to put any reference to original source.
// If someone recognized these code and know where the original code came from,
// please raise an issue so that I can put attribution here.

const supportBlob = () =>
  FileReader !== undefined &&
  Blob !== undefined &&
  (() => {
    try {
      // tslint:disable-next-line:no-unused-expression
      new Blob();
      return true;
    } catch (error) {
      return false;
    }
  })();

function parseHeaders(rawHeaders: any) {
  const headers = new Headers();
  // Replace instances of \r\n and \n followed by at least one space
  // or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
  preProcessedHeaders.split(/\r?\n/).forEach((line: any) => {
    const parts = line.split(':');
    const key = parts.shift().trim();
    if (key) {
      const value = parts.join(':').trim();
      headers.append(key, value);
    }
  });
  return headers;
}

function xhrFetch(url: string, conf: IRequest): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    // const request = new Request(url, conf);
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      const options: any = {
        headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
        status: xhr.status,
        statusText: xhr.statusText,
      };
      options.url =
        'responseURL' in xhr
          ? xhr.responseURL
          : options.headers.get('X-Request-URL');
      const body =
        !conf.responseType || conf.responseType === 'text'
          ? xhr.responseText
          : xhr.response;
      resolve(new Response(body, options));
    };

    xhr.onerror = () => {
      reject(new TypeError('Network request failed'));
    };

    xhr.ontimeout = () => {
      reject(new TypeError('Network request failed'));
    };

    if (xhr.upload && conf.onUploadProgress) {
      xhr.upload.onprogress = conf.onUploadProgress;
    }

    if (conf.onDownloadProgress) {
      xhr.onprogress = conf.onDownloadProgress;
    }

    xhr.open(conf.method, url, true);

    if (conf.credentials === 'include') {
      xhr.withCredentials = true;
    }

    xhr.responseType = conf.responseType || 'text';
    if (conf.action === 'download') {
      if (!conf.responseType && supportBlob()) {
        xhr.responseType = 'blob';
      }
    }

    conf.headers.forEach((name, value) => {
      xhr.setRequestHeader(name, value);
    });

    xhr.send(conf.body);
  });
}

export default xhrFetch;
