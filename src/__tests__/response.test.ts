import { instances } from './__fixtures__';

describe('Response', () => {
  it('parses JSON by default', async () => {
    const { fm, instance, path, url } = instances();
    const expected = {
      foo: 'bar',
    };
    fm.once(url, expected, { method: 'GET', name: path });

    const res = await instance.request<typeof expected>(path);
    expect(res.ok).toBe(true);
    expect(res.raw.bodyUsed).toBe(false);
    expect(res.data).toEqual(expected);
  });

  it(`doesn't parse if content type header is non json`, async () => {
    const { fm, instance, path, url } = instances();
    fm.once(url, 'foo', { method: 'GET', name: path });

    const res = await instance.request(path);
    expect(res.ok).toBe(true);
    expect(res.raw.bodyUsed).toBe(false);

    const data = await res.raw.text();
    expect(data).toBe('foo');
  });

  it('ignores JSON error', async () => {
    const { fm, instance, path, url } = instances();
    fm.once(
      url,
      {
        body: 'foo',
        status: 201,
        headers: { 'content-type': 'application/json' },
      },
      { method: 'GET', name: path },
    );

    const res = await instance.request(path);
    expect(res.ok).toBe(true);
    expect(res.raw.bodyUsed).toBe(false);

    const data = await res.raw.text();
    expect(data).toBe('foo');
  });

  it('handles non-ok status JSON', async () => {
    const { fm, instance, path, url } = instances();
    const expected = {
      foo: 'bar',
    };
    fm.once(
      url,
      { body: expected, status: 400 },
      { method: 'GET', name: path },
    );

    expect.assertions(3);
    try {
      await instance.request(path);
    } catch (err) {
      expect(err.response).toBeTruthy();
      expect(err.response.data).toEqual(expected);
      expect(
        err.message.indexOf('Non OK HTTP response status: 400'),
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it('handles multiple transformer', async () => {
    const { fm, instance, path, url } = instances();
    const expected = {
      foo: 'bar',
    };
    const trf1 = jest.fn(() => ({ foo: '1' }));
    const trf2 = jest.fn((_, data) => ({ ...data, foo: 'bar' }));
    fm.once(url, {}, { method: 'GET', name: path });

    const res = await instance.request<typeof expected>({
      path,
      transformResponse: [trf1, trf2],
    });
    expect(res.ok).toBe(true);
    expect(trf1).toHaveBeenCalledTimes(1);
    expect(trf2).toHaveBeenCalledTimes(1);
    expect(res.data).toEqual(expected);
  });
});
