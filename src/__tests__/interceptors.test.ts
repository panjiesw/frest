import frest from '../';
import { instances, BASE } from './__fixtures__';

describe('Interceptors', () => {
  it('correctly use/eject', () => {
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

  describe('Request', () => {
    it('intercepts', async () => {
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
      expect(res.raw.ok).toBe(true);
      expect(fm.calls(path).length).toBe(1);
      expect(req1).toHaveBeenCalledTimes(1);
      expect(req2).toHaveBeenCalledTimes(1);
      expect(order[0]).toBe('req1');
      expect(order[1]).toBe('req2');
    });

    it('handles error', async () => {
      const { instance, fm, path, url } = instances();
      const req1 = jest.fn(() => {
        // tslint:disable-next-line:no-string-throw
        throw 'foobar';
      });

      fm.once(url, {}, { method: 'GET', name: path });

      instance.interceptors.request.use(req1);

      expect.assertions(2);
      try {
        await instance.request(path);
      } catch (err) {
        expect(req1).toHaveBeenCalledTimes(1);
        expect(err.message).toBe(
          'Error in request transform/interceptor: foobar',
        );
      }
    });

    it('throws error if not return config', async () => {
      const { instance, fm, path, url } = instances();
      const req1 = jest.fn();

      fm.once(url, {}, { method: 'GET', name: path });

      instance.interceptors.request.use(req1);

      expect.assertions(2);
      try {
        await instance.request(path);
      } catch (err) {
        expect(req1).toHaveBeenCalledTimes(1);
        expect(
          err.message.indexOf(`didn't return request config`),
        ).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Response', () => {
    it('intercepts', async () => {
      const { instance, fm, path, url } = instances();
      const order: string[] = [];
      const expected = {
        foo: 'bar',
      };
      const res1 = jest.fn(r => {
        order.push('res1');
        return Promise.resolve(r.response);
      });
      const res2 = jest.fn(r => {
        order.push('res2');
        r.response.data = expected;
        return Promise.resolve(r.response);
      });

      fm.once(url, { foo: 'BAR' }, { method: 'GET', name: path });

      instance.interceptors.response.use(res1);
      instance.interceptors.response.use(res2);

      const res = await instance.request(path);
      expect(res.raw.ok).toBe(true);
      expect(res.data).toEqual(expected);
      expect(fm.calls(path).length).toBe(1);
      expect(res1).toHaveBeenCalledTimes(1);
      expect(res2).toHaveBeenCalledTimes(1);
      expect(order[0]).toBe('res1');
      expect(order[1]).toBe('res2');
    });

    it('handles error', async () => {
      const { instance, fm, path, url } = instances();
      const res1 = jest.fn(() => {
        // tslint:disable-next-line:no-string-throw
        throw 'foobar';
      });

      fm.once(url, {}, { method: 'GET', name: path });

      instance.interceptors.response.use(res1);

      expect.assertions(2);
      try {
        await instance.request(path);
      } catch (err) {
        expect(res1).toHaveBeenCalledTimes(1);
        expect(err.message).toBe(
          'Error in response transform/interceptor: foobar',
        );
      }
    });

    it('throws error if not return response', async () => {
      const { instance, fm, path, url } = instances();
      const res1 = jest.fn();

      fm.once(url, {}, { method: 'GET', name: path });

      instance.interceptors.response.use(res1);

      expect.assertions(2);
      try {
        await instance.request(path);
      } catch (err) {
        expect(res1).toHaveBeenCalledTimes(1);
        expect(
          err.message.indexOf(`didn't return response`),
        ).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Error', () => {
    it('intercepts', async () => {
      const { instance, fm, path, url } = instances();
      const order: string[] = [];
      const err1 = jest.fn(() => {
        order.push('err1');
        return Promise.resolve(null);
      });
      const err2 = jest.fn(() => {
        order.push('err2');
        return Promise.resolve(null);
      });

      fm.once(url, { status: 400 }, { method: 'GET', name: path });

      instance.interceptors.error.use(err1);
      instance.interceptors.error.use(err2);

      expect.assertions(5);
      try {
        await instance.request(path);
      } catch (err) {
        expect(err1).toHaveBeenCalledTimes(1);
        expect(err2).toHaveBeenCalledTimes(1);
        expect(err.message.indexOf('Non OK HTTP')).toBeGreaterThanOrEqual(0);
        expect(order[0]).toBe('err1');
        expect(order[1]).toBe('err2');
      }
    });

    it('recovers', async () => {
      const { instance, fm, path, url } = instances();
      const expected = { foo: 'bar' };
      const err1 = jest.fn(() => Promise.resolve());
      const err2 = jest.fn(err => {
        return err.frest.request('recover');
      });

      fm.once(url, { status: 500 }, { method: 'GET', name: path }).once(
        `${BASE}/recover`,
        expected,
        { method: 'GET', name: 'recover' },
      );

      instance.interceptors.error.use(err2);
      instance.interceptors.error.use(err1);

      const res = await instance.get(path);
      expect(res.raw.ok).toBe(true);
      expect(res.data).toEqual(expected);
    });

    it('handles error', async () => {
      const { instance, fm, path, url } = instances();
      const err1 = jest.fn(() => Promise.resolve());
      const err2 = jest.fn(() => Promise.reject('foobar'));

      fm.once(url, { status: 500 }, { method: 'GET', name: path });

      instance.interceptors.error.use(err2);
      instance.interceptors.error.use(err1);

      expect.assertions(1);
      try {
        await instance.get(path);
      } catch (err) {
        expect(err).toBe('foobar');
      }
    });
  });
});
