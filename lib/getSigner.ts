import ethProvider from 'eth-provider';
import { BrowserProvider } from 'ethers';
import { ethers, network } from 'hardhat';

export default async function getSigner() {
  // Network is configured to use Frame
  if ((network.config as any).url === 'http://127.0.0.1:1248') {
    const frame = ethProvider('frame', {
      origin: 'Hardhat',
    });

    const provider = new BrowserProvider(frame, network.config.chainId);
    const signer = await provider.getSigner();
    return signer;
  }

  const [signer] = await ethers.getSigners();
  return signer;
}
