import test from 'ava';
import fetchMock from 'fetch-mock';
import { BASE, getInstance } from '../fixtures';

test('string arg must become path', async t => {
	const url = `${BASE}/rconfstring`;
	const fm = fetchMock.getOnce(url, {});
	const frest = getInstance();

	const res = await frest.request('rconfstring');
	const lastOptions = fm.lastOptions(url);
	t.true(res.origin.ok);
	t.true(fm.called(url));
	t.is(lastOptions.method, 'GET');
	t.truthy(lastOptions.headers);
});

test('string array arg must become path', async t => {
	const url = `${BASE}/foo/bar`;
	const fm = fetchMock.getOnce(url, {});
	const frest = getInstance();

	const res = await frest.request(['foo', 'bar']);
	const lastOptions = fm.lastOptions(url);
	t.true(res.origin.ok);
	t.true(fm.called(url));
	t.is(lastOptions.method, 'GET');
});

test('object arg string path', async t => {
	const url = `${BASE}/rconfobj`;
	const fm = fetchMock.postOnce(url, {});
	const frest = getInstance();

	const res = await frest.request({
		method: 'POST',
		path: 'rconfobj',
	});
	const lastOptions = fm.lastOptions(url);
	t.true(res.origin.ok);
	t.true(fm.called(url));
	t.is(lastOptions.method, 'POST');
});

test('object arg string array', async t => {
	const url = `${BASE}/foo/bar/baz`;
	const fm = fetchMock.putOnce(url, {});
	const frest = getInstance();

	const res = await frest.request({
		method: 'PUT',
		path: ['foo', 'bar', 'baz'],
	});
	const lastOptions = fm.lastOptions(url);
	t.true(res.origin.ok);
	t.true(fm.called(url));
	t.is(lastOptions.method, 'PUT');
});

test('object arg headers', async t => {
	const url = `${BASE}/headers`;
	const fm = fetchMock.getOnce(
		(u, o) =>
			u === url &&
			o.headers instanceof Headers &&
			o.headers.get('X-FOO') === 'bar',
		{},
	);
	const frest = getInstance();

	const res = await frest.request({
		headers: new Headers({ 'X-FOO': 'bar' }),
		path: 'headers',
	});
	const lastOptions = fm.lastOptions(url);
	t.true(res.origin.ok);
	t.true(fm.called(url));
	t.is(lastOptions.method, 'GET');
	if (lastOptions.headers instanceof Headers) {
		t.is(lastOptions.headers.get('X-FOO'), 'bar');
	} else {
		t.fail('Unexpected headers');
	}
});

test('both arg', async t => {
	const url = `${BASE}/both`;
	const fm = fetchMock.deleteOnce(url, {});
	const frest = getInstance();

	const res = await frest.request('both', { method: 'DELETE' });
	t.true(res.origin.ok);
	t.true(fm.called(url));
});
