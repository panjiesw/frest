module.exports = function(api) {
  api.cache.invalidate(() => process.env.NODE_ENV === 'production');

  const presets = [
    ['@babel/preset-env', { loose: true }],
    '@babel/preset-typescript',
  ];

  const plugins = [
    ['@babel/proposal-class-properties', { loose: true }],
  ]

  return {
    presets,
    plugins,
  }
}
