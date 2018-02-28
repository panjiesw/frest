import test from 'ava';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { Frest, IAfterResponseInterceptorArg, IFrestError } from '../../';
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

  t.is((frest as any).interceptors.after.length, 1);
  t.is((frest as any).interceptors.before.length, 1);
  t.is((frest as any).interceptors.error.length, 1);
});

test('add-remove', t => {
  const int: any = sinon.spy();
  int.id = 'test';

  const frest = new Frest();

  frest.addAfterResponseInterceptor(int);
  t.is((frest as any).interceptors.after.length, 1);
  frest.removeAfterResponseInterceptor(int.id);
  t.is((frest as any).interceptors.after.length, 0);
  frest.addAfterResponseInterceptor(int);
  t.is((frest as any).interceptors.after.length, 1);
  frest.removeAfterResponseInterceptor(int);
  t.is((frest as any).interceptors.after.length, 0);

  frest.addBeforeRequestInterceptor(int);
  t.is((frest as any).interceptors.before.length, 1);
  frest.removeBeforeRequestInterceptor(int.id);
  t.is((frest as any).interceptors.before.length, 0);
  frest.addBeforeRequestInterceptor(int);
  t.is((frest as any).interceptors.before.length, 1);
  frest.removeBeforeRequestInterceptor(int);
  t.is((frest as any).interceptors.before.length, 0);

  frest.addErrorInterceptor(int);
  t.is((frest as any).interceptors.error.length, 1);
  frest.removeErrorInterceptor(int.id);
  t.is((frest as any).interceptors.error.length, 0);
  frest.addErrorInterceptor(int);
  t.is((frest as any).interceptors.error.length, 1);
  frest.removeErrorInterceptor(int);
  t.is((frest as any).interceptors.error.length, 0);
});

test('before request interceptor', async t => {
  const url = `${BASE}/before`;
  const fm = fetchMock.once(url, {});
  const order: string[] = [];
  const int1: any = sinon.stub().callsFake(r => {
    order.push('int1');
    return Promise.resolve(r.requestConfig);
  });
  int1.id = 'int1';
  const int2: any = sinon.stub().callsFake(r => {
    order.push('int2');
    r.requestConfig.foo = 'bar';
    return Promise.resolve(r.requestConfig);
  });
  int2.id = 'int2';
  const frest = new Frest({
    base: BASE,
    fetch,
    interceptors: {
      before: [int1],
    },
  });
  frest.addBeforeRequestInterceptor(int2);

  const res = await frest.request<{}>('before');
  t.true(res.origin.ok);
  t.true(fm.called());
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
  const int = sinon
    .stub()
    .callsFake(async (arg: IAfterResponseInterceptorArg) => {
      arg.wrappedResponse.value = await arg.wrappedResponse.origin.json();
      return arg.wrappedResponse;
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
  t.deepEqual(res.value, expectedResponse);
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
    if (err.wrappedResponse) {
      const value = await err.wrappedResponse.origin.json();
      err.wrappedResponse.value = value;
      return err.wrappedResponse;
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
  t.deepEqual(res.value, { error: 'test' });
  t.true(fm.called());
  t.true(int.calledOnce);
});
