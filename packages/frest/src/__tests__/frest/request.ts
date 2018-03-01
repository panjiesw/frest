import test from 'ava';
import { BASE, instances } from '../fixtures';

test('string arg must become path', async t => {
  const { frest, fm, url, path } = instances();
  fm.getOnce(url, {}, { method: 'GET', name: path });

  const res = await frest.request(path);
  const lastOptions = fm.lastOptions(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is(lastOptions.method, 'GET');
  t.truthy(lastOptions.headers);
});

test('string array arg must become path', async t => {
  const { frest, fm } = instances();
  fm.getOnce(`${BASE}/foo/bar`, {}, { method: 'GET', name: 'foobar' });

  const res = await frest.request(['foo', 'bar']);
  const lastOptions = fm.lastOptions('foobar');
  t.true(res.origin.ok);
  t.true(fm.called('foobar'));
  t.is(lastOptions.method, 'GET');
});

test('object arg string path', async t => {
  const { frest, fm, path, url } = instances();
  fm.postOnce(url, {}, { method: 'POST', name: path });

  const res = await frest.request({
    method: 'POST',
    path,
  });
  const lastOptions = fm.lastOptions(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is(lastOptions.method, 'POST');
});

test('object arg string array', async t => {
  const url = `${BASE}/foo/bar/baz`;
  const { frest, fm } = instances();
  fm.putOnce(url, {}, { method: 'PUT', name: 'foobarbaz' });

  const res = await frest.request({
    method: 'PUT',
    path: ['foo', 'bar', 'baz'],
  });
  const lastOptions = fm.lastOptions('foobarbaz');
  t.true(res.origin.ok);
  t.true(fm.called('foobarbaz'));
  t.is(lastOptions.method, 'PUT');
});

test('object arg headers', async t => {
  const { frest, fm, path, url } = instances();
  fm.getOnce(
    url,
    {},
    { method: 'GET', name: path, headers: { 'X-FOO': 'bar' } },
  );

  const res = await frest.request({
    headers: new Headers({ 'X-FOO': 'bar' }),
    path,
  });
  const lastOptions = fm.lastOptions(path);
  t.true(res.origin.ok);
  t.true(fm.called(path));
  t.is(lastOptions.method, 'GET');
  if (lastOptions.headers instanceof Headers) {
    t.is(lastOptions.headers.get('X-FOO'), 'bar');
  } else {
    t.fail('Unexpected headers');
  }
});

test('both arg', async t => {
  const { frest, fm, path, url } = instances();
  fm.deleteOnce(url, {}, { method: 'DELETE', name: path });

  const res = await frest.request(path, { method: 'DELETE' });
  t.true(res.origin.ok);
  t.true(fm.called(path));
});
