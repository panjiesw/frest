/**
 * Copyright 2018 Panjie Setiawan Wicaksono
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import mock from 'xhr-mock';
import frest, { Frest, xhrFetch, ConfigMergeType } from '../';

const create = (conf: ConfigMergeType = {}): Frest => {
  return frest.create({ ...conf, fetch: xhrFetch });
};

describe('Frest on XHR', () => {
  // replace the real XHR object with the mock XHR object before each test
  beforeEach(() => mock.setup());

  // put the real XHR object back and clear the mocks after each test
  afterEach(() => mock.teardown());

  it('post', async () => {
    expect.assertions(4);
    const instance = create();

    mock.post('/foo', (req, res) => {
      expect(req.header('Content-Type')).toEqual(
        'application/json;charset=utf-8',
      );
      expect(req.body()).toEqual('{"name":"John"}');
      return res
        .status(201)
        .header('Content-Type', 'application/json')
        .body('{"id":"abc-123"}');
    });

    const res = await instance.post('foo', { name: 'John' });
    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ id: 'abc-123' });
  });

  it('get', async () => {
    expect.assertions(2);
    const instance = create();

    mock.get('/foo', (_, res) => {
      return res
        .status(200)
        .header('Content-Type', 'application/json')
        .body('{"id":"abc-123"}');
    });

    const res = await instance.get('foo');
    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ id: 'abc-123' });
  });

  it('patch', async () => {
    expect.assertions(4);
    const instance = create();

    mock.patch('/foo', (req, res) => {
      expect(req.header('Content-Type')).toEqual(
        'application/json;charset=utf-8',
      );
      expect(req.body()).toEqual('{"name":"John"}');
      return res
        .status(201)
        .header('Content-Type', 'application/json')
        .body('{"id":"abc-123"}');
    });

    const res = await instance.patch('foo', { name: 'John' });
    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ id: 'abc-123' });
  });

  it('put', async () => {
    expect.assertions(4);
    const instance = create();

    mock.put('/foo', (req, res) => {
      expect(req.header('Content-Type')).toEqual(
        'application/json;charset=utf-8',
      );
      expect(req.body()).toEqual('{"name":"John"}');
      return res
        .status(201)
        .header('Content-Type', 'application/json')
        .body('{"id":"abc-123"}');
    });

    const res = await instance.put('foo', { name: 'John' });
    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ id: 'abc-123' });
  });

  it('delete', async () => {
    expect.assertions(2);
    const instance = create();

    mock.delete('/foo', (_, res) => {
      return res
        .status(200)
        .header('Content-Type', 'application/json')
        .body('{"id":"abc-123"}');
    });

    const res = await instance.delete('foo');
    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ id: 'abc-123' });
  });
});
