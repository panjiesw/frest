// Copyright (c) 2017 Panjie Setiawan Wicaksono
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

require('core-js/fn/promise');
require('core-js/fn/array/from');
require('core-js/fn/set');
require('whatwg-fetch');

[
	require.context('./test', true, /\.ts$/),
	require.context('./src', true, /\.ts$/)
].forEach(function(context) {
	context.keys().forEach(context);
});

//# sourceMappingURL=tests.js.map
