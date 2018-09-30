import { instances } from './__fixtures__';

describe('Response', () => {
  it('parses JSON by default', async () => {
    const { fm, instance, path, url } = instances();
    const expected = {
      foo: 'bar',
    };
    fm.once(url, expected, { method: 'GET', name: path });

    const res = await instance.request<typeof expected>(path);
    expect(res.raw.ok).toBe(true);
    expect(res.raw.bodyUsed).toBe(false);
    expect(res.data).toEqual(expected);
  });

  it('ignores JSON error', async () => {
    const { fm, instance, path, url } = instances();
    fm.once(url, { body: '', status: 201 }, { method: 'GET', name: path });

    const res = await instance.request(path);
    expect(res.raw.ok).toBe(true);
    expect(res.data).toEqual({});
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
});
