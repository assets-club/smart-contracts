export default interface Config {
  verify: boolean;
  confirmations: number;

  admin: string;
  treasury: string;
  operators: string[];

  vrf: {
    coordinator: string;
    keyHash: string;
    subId: number;
  };

  reservations: Record<string, number>;
  shares: Record<string, number>;
}
