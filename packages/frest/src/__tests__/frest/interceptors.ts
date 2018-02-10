import test from 'ava';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { Frest } from '../../';
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
  const url = `${BASE}/inttestorder`;
  const fm = fetchMock.once(url, {});
  const order: string[] = [];
  const int1: any = sinon.stub().callsFake(r => {
    order.push('int1');
    return Promise.resolve(r.requestConfig);
  });
  int1.id = 'int1';
  const int2: any = sinon.stub().callsFake(r => {
    order.push('int2');
    return Promise.resolve(r.requestConfig);
  });
  int2.id = 'int2';
  const frest = new Frest({
    base: BASE,
    fetch,
    interceptors: {
      before: [int1]
    },
  });
  frest.addBeforeRequestInterceptor(int2);

  const res = await frest.request<{}>('inttestorder');
  if (frest.isWrapped(res)) {
    t.true(res.origin.ok);
    t.true(fm.called());
    t.is(order[0], 'int1');
    t.is(order[1], 'int2');
  } else {
    t.fail('Unexpected unwrapped response');
  }
});
