export default interface Config {
  log: boolean;
  verify: boolean;
  confirmations: number;

  admin: string;
  treasury: string;

  vrf: {
    coordinator: string;
    keyHash: string;
    subId: number;
  };

  shares: Record<string, number>;
}
