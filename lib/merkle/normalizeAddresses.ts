import { getAddress } from 'ethers';

export default function normalizeAddresses(addresses: string[]) {
  const deduped = [...new Set(addresses.map((address) => getAddress(address.trim())))];
  deduped.sort();
  return deduped;
}
