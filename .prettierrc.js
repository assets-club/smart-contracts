module.exports = {
  ...require('@mathieu-bour/prettier-config'),
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports'), require.resolve('prettier-plugin-solidity')],
};
