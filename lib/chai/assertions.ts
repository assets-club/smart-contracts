import { AssertionError, expect, use } from 'chai';

use(function (chai: Chai.ChaiStatic, utils: Chai.ChaiUtils) {
  chai.Assertion.addProperty('revertedOnlyOwner', function (this: any) {
    return new chai.Assertion(this._obj).to.be.revertedWith('Ownable: caller is not the owner');
  });
});
