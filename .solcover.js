module.exports = {
  istanbulReporter: ['lcov', 'text'],
  skipFiles: ['testing/TheAssetsClubTesnet.sol'],
  modifierWhitelist: ['onlyAllowedOperatorApproval'],
};
