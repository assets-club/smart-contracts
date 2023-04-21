export default interface Config {
  log: boolean;
  verify: boolean;
  confirmations: number;

  mock?: boolean;

  admin: string;
  nftParis: string;

  vrf: {
    coordinator: string;
    keyHash: string;
    subId: number;
  };
}
