import { instances } from './__fixtures__';

describe('Request Method', () => {
  test('post', async () => {
    const { instance, fm, path, url } = instances();
    fm.once(
      (u, o) => u === url && (o as any).action === 'post',
      {},
      { method: 'POST', name: path },
    );

    const res = await instance.post(path);

    expect(res.origin.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  test('get', async () => {
    const { instance, fm, path, url } = instances();
    fm.once(
      (u, o) => u === url && (o as any).action === 'get',
      {},
      { method: 'GET', name: path },
    );

    const res = await instance.get(path);

    expect(res.origin.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  test('put', async () => {
    const { instance, fm, path, url } = instances();
    fm.once(
      (u, o) => u === url && (o as any).action === 'put',
      {},
      { method: 'PUT', name: path },
    );

    const res = await instance.put(path);

    expect(res.origin.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  test('delete', async () => {
    const { instance, fm, path, url } = instances();
    fm.once(
      (u, o) => u === url && (o as any).action === 'delete',
      {},
      { method: 'DELETE', name: path },
    );

    const res = await instance.delete(path);

    expect(res.origin.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  test('patch', async () => {
    const { instance, fm, path, url } = instances();
    fm.once(
      (u, o) => u === url && (o as any).action === 'patch',
      {},
      { method: 'PATCH', name: path },
    );

    const res = await instance.patch(path);

    expect(res.origin.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });

  test('options', async () => {
    const { instance, fm, path, url } = instances();
    fm.once(
      (u, o) => u === url && (o as any).action === 'options',
      {},
      { method: 'OPTIONS', name: path },
    );

    const res = await instance.options(path);

    expect(res.origin.ok).toBe(true);
    expect(fm.calls(path).length).toBe(1);
  });
});
