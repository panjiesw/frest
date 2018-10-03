import fetchMock from 'fetch-mock';
import { instances, BASE } from './__fixtures__';

describe('Request', () => {
  it('accepts string arg', async () => {
    const { instance, fm, url, path } = instances();
    fm.getOnce(
      (u, o) =>
        u === url && o.headers instanceof Headers && o.headers.has('Accept'),
      {},
      { method: 'GET', name: path },
    );

    const res = await instance.request(path);

    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it('accepts string array arg', async () => {
    const { instance, fm } = instances();
    fm.getOnce(`${BASE}/foo/bar`, {}, { method: 'GET', name: 'foobar' });

    const res = await instance.request(['foo', 'bar']);
    expect(res.raw.ok).toBe(true);
    expect(fm.calls('foobar').length).toBe(1);
  });

  it('accepts config object arg', async () => {
    const { fm, instance, path, url } = instances();
    fm.once(url, {}, { method: 'POST', name: path });

    const res = await instance.request({ path, method: 'POST' });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it('accepts config object arg with array path', async () => {
    const { fm, instance } = instances();
    const url = `${BASE}/foo/bar/baz`;
    fm.once(url, {}, { method: 'POST', name: 'foobarbaz' });

    const res = await instance.request({
      path: ['foo', 'bar', 'baz'],
      method: 'POST',
    });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls('foobarbaz').length).toBe(1);
  });

  it('merges request & instance config', async () => {
    const { instance, path, url } = instances({
      credentials: 'include',
      headers: { get: new Headers({ 'X-DOH': 'dah' }) },
    });
    const fm = fetchMock.sandbox();
    fm.getOnce(
      url,
      {},
      {
        method: 'GET',
        name: path,
        headers: new Headers({
          'X-FOO': 'bar',
          'X-DOH': 'dah',
          Accept: 'application/json',
        }) as any,
      },
    );

    const res = await instance.request({
      path,
      headers: new Headers({ 'X-FOO': 'bar' }),
      cache: 'default',
      fetch: fm,
    });
    const lastOptions = fm.lastOptions(path);

    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
    expect(lastOptions.cache).toBe('default');
    expect(lastOptions.credentials).toBe('include');
  });

  it('accepts 2 arg', async () => {
    const { fm, instance, path, url } = instances();
    fm.once(url, {}, { method: 'PUT', name: path });

    const res = await instance.request(path, { method: 'PUT' });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it('stringify object to JSON by default', async () => {
    const { fm, instance, path, url } = instances();
    const body = {
      foo: 'bar',
    };
    fm.once(
      (u, o) => {
        return u === url && o.body === JSON.stringify(body);
      },
      {},
      { method: 'PATCH', name: path },
    );

    const res = await instance.patch({ path, body });

    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it(`doesn't overwrite content type header`, async () => {
    const { fm, instance, path, url } = instances();
    const body = {
      foo: 'bar',
    };
    const headers = new Headers({
      'Content-Type': 'application/json;charset=ascii',
    });
    fm.once(
      (u, o) => {
        return u === url && o.body === JSON.stringify(body);
      },
      {},
      { method: 'PATCH', name: path, headers: headers as any },
    );

    const res = await instance.patch({ path, body, headers });

    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it(`doesn't transform no-data method`, async () => {
    const { fm, instance, path, url } = instances();
    const body = {
      foo: 'bar',
    };
    fm.once(url, {}, { method: 'GET', name: path });

    const res = await instance.request({ path, body });

    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
    expect(typeof fm.lastOptions(path).body).toBe('object');
  });

  it('processes URLSearchParams data', async () => {
    const { fm, instance, path, url } = instances();
    const body = new URLSearchParams();
    body.append('foo', 'bar');

    fm.once(
      (u, o) => u === url && o.body === body.toString(),
      {},
      { method: 'POST', name: path },
    );

    const res = await instance.post({ path, body });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it('processes typed array', async () => {
    const { fm, instance, path, url } = instances();
    const body = new Uint8Array(2);

    fm.once(
      (u, o) => u === url && o.body === body.buffer,
      {},
      { method: 'POST', name: path },
    );

    const res = await instance.post({ path, body });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it(`doesn't process form data`, async () => {
    const { fm, instance, path, url } = instances();
    const body = new FormData();

    fm.once(
      (u, o) => u === url && o.body === body,
      {},
      { method: 'POST', name: path },
    );

    const res = await instance.post({ path, body });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it(`doesn't process Array buffer`, async () => {
    const { fm, instance, path, url } = instances();
    const body = new ArrayBuffer(2);

    fm.once(
      (u, o) => u === url && o.body === body,
      {},
      { method: 'POST', name: path },
    );

    const res = await instance.post({ path, body });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it(`doesn't process buffer`, async () => {
    const { fm, instance, path, url } = instances();
    const body = new Buffer(2);

    fm.once(
      (u, o) => u === url && o.body === body,
      {},
      { method: 'POST', name: path },
    );

    const res = await instance.post({ path, body });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it(`doesn't process file`, async () => {
    const { fm, instance, path, url } = instances();
    const body = new File([], 'asd');

    fm.once(
      (u, o) => u === url && o.body === body,
      {},
      { method: 'POST', name: path },
    );

    const res = await instance.post({ path, body });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it(`doesn't process blob`, async () => {
    const { fm, instance, path, url } = instances();
    const body = new Blob([]);

    fm.once(
      (u, o) => u === url && o.body === body,
      {},
      { method: 'POST', name: path },
    );

    const res = await instance.post({ path, body });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it('handles multiple transformer', async () => {
    const { fm, instance, path, url } = instances();
    const expected = {
      foo: 'bar',
    };
    const trf1 = jest.fn(() => ({ foo: '1' }));
    const trf2 = jest.fn((_, data) => JSON.stringify({ ...data, foo: 'bar' }));
    fm.once(
      (u, o) => u === url && o.body === JSON.stringify(expected),
      {},
      { method: 'PUT', name: path },
    );

    const res = await instance.put({
      path,
      transformRequest: [trf1, trf2],
    });
    expect(res.raw.ok).toBe(true);
    expect(trf1).toHaveBeenCalledTimes(1);
    expect(trf2).toHaveBeenCalledTimes(1);
    expect(fm.calls(path).length).toBe(1);
  });
});
