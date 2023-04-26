export default interface Config {
  log: boolean;
  verify: boolean;
  confirmations: number;

  mock?: boolean;

  admin: string;
  treasury?: string;
  paris: string;

  vrf: {
    coordinator: string;
    keyHash: string;
    subId: number;
  };
}
