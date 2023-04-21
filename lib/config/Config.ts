export default interface Config {
  log: boolean;
  verify: boolean;
  confirmations: number;

  mock?: boolean;

  admin: string;
  treasury: string;
  nftParis: string;

  vrf: {
    coordinator: string;
    keyHash: string;
    subId: number;
  };

  shares: Record<string, number>;
}
