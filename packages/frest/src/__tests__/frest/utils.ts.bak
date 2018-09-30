import test from 'ava';
import { trimSlashes } from '../../utils';

test('trimSlashes with host', t => {
  const input = 'http://example.com/api//test';
  const expected = 'http://example.com/api/test';
  const actual = trimSlashes(input);
  t.is(actual, expected, 'must remove slashes');
});

test('trimSlashes with host and trailing slash', t => {
  const input = 'http://example.com/api//test/';
  const expected = 'http://example.com/api/test/';
  const actual = trimSlashes(input);
  t.is(actual, expected, 'must remove slashes & keep trailing slash');
});

test('trimSlashes with leading slash', t => {
  const input = '/api//test';
  const expected = '/api/test';
  const actual = trimSlashes(input);
  t.is(actual, expected, 'must remove slashes & keep leading slash');
});

test('trimSlashes with leading & trailing slashes', t => {
  const input = '/api//test/';
  const expected = '/api/test/';
  const actual = trimSlashes(input);
  t.is(actual, expected, 'must remove slashes & keep leading & trailing slash');
});

test('trimSlashes', t => {
  const input = 'api//test';
  const expected = 'api/test';
  const actual = trimSlashes(input);
  t.is(actual, expected, 'must remove slashes');
});

test('trimSlashes multiple leading slashes', t => {
  const input = '//api//test';
  const expected = '//api/test';
  const actual = trimSlashes(input);
  t.is(actual, expected, 'must remove slashes & keep leading slashes');
});

test('trimSlashes multiple trailing slashes', t => {
  const input = 'api//test//';
  const expected = 'api/test/';
  const actual = trimSlashes(input);
  t.is(actual, expected, 'must remove slashes');
});
