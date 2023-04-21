import { AssertionError, expect, use } from 'chai';

use(function (chai: Chai.ChaiStatic, utils: Chai.ChaiUtils) {
  chai.Assertion.addMethod('revertedOnlyOwner', function (this: any, contract: { interface: any }) {
    return new chai.Assertion(this._obj).to.be.revertedWithCustomError(contract, 'Unauthorized').withArgs();
  });
});
