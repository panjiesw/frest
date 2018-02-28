import test from 'ava';
import { Frest, IConfig } from '../../';
import { FREST_DEFAULT_CONFIG } from '../../Frest';
import { BASE } from '../fixtures';

test('constructor no arg default config', t => {
	const frest = new Frest();
	t.deepEqual(
		frest.config,
		FREST_DEFAULT_CONFIG,
		'must be equal the default config',
	);
});

test('constructor string arg become base', t => {
	const frest = new Frest(BASE);
	const expected = {
		...FREST_DEFAULT_CONFIG,
		base: BASE,
	};
	t.deepEqual(frest.config, expected, 'must have the same base');
	t.is(frest.base, BASE);
});

test('constructor merge config', t => {
	const config: Partial<IConfig> = {
		base: BASE,
		method: 'POST',
	};
	const expected = {
		...FREST_DEFAULT_CONFIG,
		...config,
	};
	const frest = new Frest(config);
	t.deepEqual(frest.config, expected, 'must have the merged config');
});
