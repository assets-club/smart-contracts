export default interface Config {
  treasury: string;
  vrf: {
    coordinator: string;
    keyHash: string;
    subId: number;
  };
}
