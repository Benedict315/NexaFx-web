/**
 * Truncates a Stellar public key for display.
 * e.g. GABCDEFG...WXYZ (shows `chars` from each end, separated by "...")
 */
export const truncateStellarAddress = (
  address: string,
  chars = 6
): string => {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * Determines the Stellar network from environment config.
 * Falls back to checking the key prefix (Stellar mainnet keys start with 'G').
 */
export const getStellarNetwork = (): "mainnet" | "testnet" => {
  const env = process.env.NEXT_PUBLIC_STELLAR_NETWORK;
  if (env === "testnet") return "testnet";
  return "mainnet";
};

/**
 * Builds the Stellar Expert explorer URL for a given account address.
 * Uses the correct subdomain for mainnet vs. testnet.
 */
export const stellarExpertUrl = (
  address: string,
  network: "mainnet" | "testnet"
): string => {
  const networkPath = network === "testnet" ? "testnet" : "public";
  return `https://stellar.expert/explorer/${networkPath}/account/${address}`;
};
