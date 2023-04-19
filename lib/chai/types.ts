declare namespace Chai {
  interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
    revertedOnlyOwner: AsyncAssertion;
  }
}
