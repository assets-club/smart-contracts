declare namespace Chai {
  interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
    revertedOnlyOwner(contract: { interface: any }): AsyncAssertion;
  }
}
