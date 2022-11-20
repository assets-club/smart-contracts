import { ContractReceipt, ContractTransaction } from 'ethers';

/**
 * Wait for an {@see ContractTransaction}. This function allows to write the contract interactions more fluently.
 * @param tx The {@see ContractTransaction} to wait for.
 * @param confirmations The number of blocks to wait.
 * @example
 *   const tx = await POK.grantRole(POOKY_CONTRACT, PookyMintEvent.address);
 *   await tx.wait();
 *
 *   Can be replaced by:
 *   await waitTx(POK.grantRole(POOKY_CONTRACT, PookyMintEvent.address));
 */
export default async function waitTx(
  tx: ContractTransaction | Promise<ContractTransaction>,
  confirmations?: number,
): Promise<ContractReceipt> {
  return await (await tx).wait(confirmations);
}
