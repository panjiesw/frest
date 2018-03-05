import test from 'ava';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { Frest, IAfterInterceptorArg, IFrestError } from '../../';
import { BASE } from '../fixtures';

test('constructor interceptors', t => {
  const int: any = sinon.spy();
  int.id = 'test';

  const frest = new Frest({
    interceptors: {
      after: [int],
      before: [int],
      error: [int],
    },
  });

  t.is(frest.config.interceptors.after.length, 1);
  t.is(frest.config.interceptors.before.length, 1);
  t.is(frest.config.interceptors.error.length, 1);
});

test('add-remove', t => {
  const int: any = sinon.spy();
  int.id = 'test';

  const frest = new Frest();

  frest.addAfterInterceptor(int);
  t.is(frest.config.interceptors.after.length, 1);
  frest.removeAfterInterceptor(int.id);
  t.is(frest.config.interceptors.after.length, 0);
  frest.addAfterInterceptor(int);
  t.is(frest.config.interceptors.after.length, 1);
  frest.removeAfterInterceptor(int);
  t.is(frest.config.interceptors.after.length, 0);

  frest.addBeforeInterceptor(int);
  t.is(frest.config.interceptors.before.length, 1);
  frest.removeBeforeInterceptor(int.id);
  t.is(frest.config.interceptors.before.length, 0);
  frest.addBeforeInterceptor(int);
  t.is(frest.config.interceptors.before.length, 1);
  frest.removeBeforeInterceptor(int);
  t.is(frest.config.interceptors.before.length, 0);

  frest.addErrorInterceptor(int);
  t.is(frest.config.interceptors.error.length, 1);
  frest.removeErrorInterceptor(int.id);
  t.is(frest.config.interceptors.error.length, 0);
  frest.addErrorInterceptor(int);
  t.is(frest.config.interceptors.error.length, 1);
  frest.removeErrorInterceptor(int);
  t.is(frest.config.interceptors.error.length, 0);
});

test('before request interceptor', async t => {
  const url = `${BASE}/before`;
  const fm = fetchMock.once(url, {});
  const order: string[] = [];
  const int1: any = sinon.stub().callsFake(r => {
    order.push('int1');
    return Promise.resolve(r.request);
  });
  int1.id = 'int1';
  const int2: any = sinon.stub().callsFake(r => {
    order.push('int2');
    r.request.foo = 'bar';
    return Promise.resolve(r.request);
  });
  int2.id = 'int2';
  const frest = new Frest({
    base: BASE,
    fetch,
    interceptors: {
      before: [int1],
    },
  });
  frest.addBeforeInterceptor(int2);

  const res = await frest.request<{}>('before');
  t.true(res.origin.ok);
  t.true(fm.called(url));
  t.is((fm.lastOptions() as any).foo, 'bar');
  t.true(int1.calledOnce);
  t.true(int2.calledOnce);
  t.is(order[0], 'int1');
  t.is(order[1], 'int2');
});

test('after response interceptor', async t => {
  const url = `${BASE}/after`;
  const expectedResponse = {
    foo: 'bar',
  };
  const fm = fetchMock.once(url, expectedResponse);
  const int = sinon.stub().callsFake(async (arg: IAfterInterceptorArg) => {
    arg.response.body = await arg.response.origin.json();
    return arg.response;
  });

  const frest = new Frest({
    base: BASE,
    fetch,
    interceptors: {
      after: [int],
    },
  });

  const res = await frest.request<{ foo: string }>('after');
  t.true(res.origin.ok);
  t.true(res.origin.bodyUsed);
  t.true(fm.called());
  t.true(int.calledOnce);
  t.deepEqual(res.body, expectedResponse);
});

test('error interceptor not recovered', async t => {
  const url = `${BASE}/error`;
  const fm = fetchMock.once(url, {
    status: 500,
  });
  const int = sinon.stub().callsFake(() => Promise.resolve(null));

  const frest = new Frest({
    base: BASE,
    fetch,
    interceptors: {
      error: [int],
    },
  });

  await t.throws(frest.request('error'));
  t.true(fm.called());
  t.true(int.calledOnce);
});

test('error interceptor recovered', async t => {
  const url = `${BASE}/error-recovered`;
  const fm = fetchMock.once(url, {
    body: {
      error: 'test',
    },
    status: 401,
  });
  const int = sinon.stub().callsFake(async (err: IFrestError) => {
    if (err.response) {
      const value = await err.response.origin.json();
      err.response.body = value;
      return err.response;
    }
    return null;
  });

  const frest = new Frest({
    base: BASE,
    fetch,
    interceptors: {
      error: [int],
    },
  });

  const res = await frest.request<{ error: string }>('error-recovered');
  t.false(res.origin.ok);
  t.deepEqual(res.body, { error: 'test' });
  t.true(fm.called());
  t.true(int.calledOnce);
});