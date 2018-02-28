import test from 'ava';
import fetchMock from 'fetch-mock';
import { BASE, getInstance } from '../fixtures';

test('post & create', async t => {
	const url = `${BASE}/testpost`;
	const fm = fetchMock.post(
		(u, o) =>
			u === url &&
			((o as any).action === 'post' || (o as any).action === 'create'),
		{},
	);
	const frest = getInstance();

	const res1 = await frest.post('testpost');
	const res2 = await frest.create('testpost');

	t.true(res1.origin.ok);
	t.true(res2.origin.ok);
	t.is(fm.calls(url).length, 2);
});

test('get & read', async t => {
	const url = `${BASE}/testget`;
	const fm = fetchMock.get(
		(u, o) =>
			u === url &&
			((o as any).action === 'get' || (o as any).action === 'read'),
		{},
	);
	const frest = getInstance();

	const res1 = await frest.get('testget');
	const res2 = await frest.read('testget');

	t.true(res1.origin.ok);
	t.true(res2.origin.ok);
	t.is(fm.calls(url).length, 2);
});

test('put & update', async t => {
	const url = `${BASE}/testput`;
	const fm = fetchMock.put(
		(u, o) =>
			u === url &&
			((o as any).action === 'put' || (o as any).action === 'update'),
		{},
	);
	const frest = getInstance();

	const res1 = await frest.put('testput');
	const res2 = await frest.update('testput');

	t.true(res1.origin.ok);
	t.true(res2.origin.ok);
	t.is(fm.calls(url).length, 2);
});

test('delete & destroy', async t => {
	const url = `${BASE}/testdelete`;
	const fm = fetchMock.delete(
		(u, o) =>
			u === url &&
			((o as any).action === 'delete' || (o as any).action === 'destroy'),
		{},
	);
	const frest = getInstance();

	const res1 = await frest.delete('testdelete');
	const res2 = await frest.destroy('testdelete');

	t.true(res1.origin.ok);
	t.true(res2.origin.ok);
	t.is(fm.calls(url).length, 2);
});

test('patch', async t => {
	const url = `${BASE}/testpatch`;
	const fm = fetchMock.patchOnce(url, {});
	const frest = getInstance();

	const res1 = await frest.patch('testpatch');

	t.true(res1.origin.ok);
	t.true(fm.called(url));
});

test('option', async t => {
	const url = `${BASE}/testoption`;
	const fm = fetchMock.once((u, o) => u === url && o.method === 'OPTION', {});
	const frest = getInstance();

	const res1 = await frest.option('testoption');

	t.true(res1.origin.ok);
	t.true(fm.called(url));
});
