import frest from '../';
import { instances } from './__fixtures__';

describe('Interceptors', () => {
  test('use/eject', () => {
    const req = jest.fn();
    const res = jest.fn();
    const err = jest.fn();

    const reqId1 = frest.interceptors.request.use(req);
    expect(frest.interceptors.request.handlers.length).toBe(1);
    frest.interceptors.request.eject(reqId1);
    expect(frest.interceptors.request.handlers.length).toBe(0);
    const reqId2 = frest.interceptors.request.use(req);
    expect(frest.interceptors.request.handlers.length).toBe(1);
    frest.interceptors.request.eject(reqId2);
    expect(frest.interceptors.request.handlers.length).toBe(0);

    const resId1 = frest.interceptors.response.use(res);
    expect(frest.interceptors.response.handlers.length).toBe(1);
    frest.interceptors.response.eject(resId1);
    expect(frest.interceptors.response.handlers.length).toBe(0);
    const resId2 = frest.interceptors.response.use(res);
    expect(frest.interceptors.response.handlers.length).toBe(1);
    frest.interceptors.response.eject(resId2);
    expect(frest.interceptors.response.handlers.length).toBe(0);

    const errId1 = frest.interceptors.error.use(err);
    expect(frest.interceptors.error.handlers.length).toBe(1);
    frest.interceptors.error.eject(errId1);
    expect(frest.interceptors.error.handlers.length).toBe(0);
    const errId2 = frest.interceptors.error.use(err);
    expect(frest.interceptors.error.handlers.length).toBe(1);
    frest.interceptors.error.eject(errId2);
    expect(frest.interceptors.error.handlers.length).toBe(0);
  });

  test('request', async () => {
    const { instance, fm, path, url } = instances();
    const order: string[] = [];
    const req1 = jest.fn(r => {
      order.push('req1');
      return Promise.resolve(r.request);
    });
    const req2 = jest.fn(r => {
      order.push('req2');
      r.request.headers.append('foo', 'bar');
      return Promise.resolve(r.request);
    });

    fm.once(
      (u, o) =>
        u === url &&
        o.headers instanceof Headers &&
        o.headers.get('foo') === 'bar',
      {},
      { method: 'GET', name: path },
    );

    instance.interceptors.request.use(req1);
    instance.interceptors.request.use(req2);

    const res = await instance.request(path);
    expect(res.origin.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
    expect(req1).toHaveBeenCalledTimes(1);
    expect(req2).toHaveBeenCalledTimes(1);
    expect(order[0]).toBe('req1');
    expect(order[1]).toBe('req2');
  });
});
