"use client";

import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink, Wallet } from "lucide-react";
import { getProfile } from "@/lib/api/users";
import { truncateStellarAddress, stellarExpertUrl, getStellarNetwork } from "@/lib/utils/stellar";
import { copyToClipboard } from "@/lib/utils/clipboard";

export function StellarWalletCard() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const network = getStellarNetwork();

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profile = await getProfile();
        if (!cancelled) {
          setWalletAddress(profile?.walletAddress ?? "");
        }
      } catch (err) {
        console.error("StellarWalletCard: failed to fetch profile", err);
        if (!cancelled) setError("Failed to load wallet address.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopy = async () => {
    const success = await copyToClipboard(walletAddress);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const explorerUrl = walletAddress
    ? stellarExpertUrl(walletAddress, network)
    : null;

  return (
    <section
      aria-label="Stellar Wallet"
      className="rounded-sm bg-card border border-border shadow-[4px_4px_12px_0px_#0000001A] p-4 md:p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20">
          <Wallet className="w-4 h-4 text-primary-foreground" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Stellar Wallet</h2>

        {/* Network badge — always shown */}
        {!isLoading && (
          <span
            className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              network === "mainnet"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {network === "mainnet" ? "Mainnet" : "Testnet"}
          </span>
        )}
      </div>

      {/* Skeleton while loading */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-5 w-full bg-muted rounded" />
          <div className="h-9 w-36 bg-muted rounded" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : !walletAddress ? (
        <p className="text-sm text-muted-foreground">No Stellar wallet linked to this account.</p>
      ) : (
        <div className="space-y-3">
          {/* Label */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Public Key
          </p>

          {/* Address row */}
          <div className="flex items-center gap-2 bg-muted rounded-sm px-3 py-2 border border-border">
            <code
              className="flex-1 text-xs md:text-sm font-mono text-foreground break-all select-all"
              title={walletAddress}
            >
              {truncateStellarAddress(walletAddress, 8)}
            </code>

            {/* Copy button */}
            <button
              id="stellar-copy-btn"
              onClick={handleCopy}
              aria-label={copied ? "Copied!" : "Copy Stellar public key"}
              title={copied ? "Copied!" : "Copy full key"}
              className="shrink-0 p-1.5 rounded hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Stellar Expert link */}
          {explorerUrl && (
            <a
              id="stellar-expert-link"
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/80 transition-colors px-3 py-1.5 rounded-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="View account on Stellar Expert explorer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on Stellar Expert
            </a>
          )}
        </div>
      )}
    </section>
  );
}
