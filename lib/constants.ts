import { parseEther } from 'ethers';

/// The maximum Assets mints, which effectively caps the total supply.
export const MAXIMUM_MINTS = 5777n;

/// Royalties 7.7% on secondary sales.
export const ROYALTIES = 770n;

/// The maximum token mints per account.
export const MAXIMUM_MINTS_PER_ACCOUNT = 7;
/// The price per token for paid mints.
export const SALE_PRICE = parseEther('0.02');

/// The private sale duration in seconds.
export const PRIVATE_SALE_DURATION = 24n * 3600n; // 1 day in seconds
/// The public sale duration in seconds.
export const PUBLIC_SALE_DURATION = 2n * 24n * 3600n; // 2 days in seconds

/// Thu Apr 27 2023 09:00:00 GMT
export const START_DATE = 1682586000n;
/// Thu Apr 28 2023 09:00:00 GMT
export const PRIVATE_SALE_END_DATE = START_DATE + PRIVATE_SALE_DURATION;
/// Thu Apr 30 2023 09:00:00 GMT
export const PUBLIC_SALE_END_DATE = PRIVATE_SALE_END_DATE + PUBLIC_SALE_DURATION;
