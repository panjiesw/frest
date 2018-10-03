import { instances } from './__fixtures__';

describe('Request Query', () => {
  it('parses object', async () => {
    const { instance, fm, url, path } = instances();
    const query = 'foo=bar&woo=wah';

    fm.once(`${url}?${query}`, {}, { method: 'GET', name: path });

    const res = await instance.get(path, { query: { foo: 'bar', woo: 'wah' } });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it('parses empty object', async () => {
    const { instance, fm, url, path } = instances();

    fm.once(url, {}, { method: 'GET', name: path });

    const res = await instance.get(path, { query: {} });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it('parses string', async () => {
    const { instance, fm, url, path } = instances();
    const query = 'foo=bar&woo=wah';

    fm.once(`${url}?${query}`, {}, { method: 'GET', name: path });

    const res = await instance.get(path, { query });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  it('parses string with question mark', async () => {
    const { instance, fm, url, path } = instances();
    const query = 'foo=bar&woo=wah';

    fm.once(`${url}?${query}`, {}, { method: 'GET', name: path });

    const res = await instance.get(path, { query: `?${query}` });
    expect(res.raw.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });
});
