"use client";

import { useEffect, useState } from "react";
import { Copy, Check, RefreshCw, Star, ExternalLink } from "lucide-react";
import { getProfile } from "@/lib/api/users";

function truncateKey(key: string, front = 8, back = 8): string {
  if (key.length <= front + back + 3) return key;
  return `${key.slice(0, front)}...${key.slice(-back)}`;
}

function isStellarKey(key: string): boolean {
  // Stellar public keys start with "G" and are 56 characters long
  return /^G[A-Z2-7]{55}$/.test(key);
}

export function StellarWalletCard() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await getProfile();
      setWalletAddress(profile.walletAddress ?? "");
    } catch (err: unknown) {
      console.error("Failed to load Stellar wallet address:", err);
      setError(err instanceof Error ? err.message : "Unable to load wallet address.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleCopy = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available in all environments
    }
  };

  const isStellar = walletAddress ? isStellarKey(walletAddress) : false;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#E58600]/30 bg-[linear-gradient(135deg,rgba(255,162,0,0.08)_0%,rgba(59,130,246,0.08)_100%)] mt-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#00000015] dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E58600]/15 border border-[#E58600]/30">
            <Star className="size-4 text-[#E58600]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Stellar Wallet</h3>
            <p className="text-[10px] text-muted-foreground font-medium">Public Key</p>
          </div>
        </div>
        {isStellar && (
          <span className="text-[9px] font-bold uppercase tracking-widest bg-[#E58600]/15 text-[#E58600] border border-[#E58600]/30 px-2 py-0.5 rounded-full">
            Stellar Network
          </span>
        )}
      </div>

      {/* Public Key Body */}
      <div className="px-5 py-4">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-8 w-full bg-muted rounded-lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-xs text-red-500">{error}</p>
            <button
              onClick={fetchWallet}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg border border-border cursor-pointer"
            >
              <RefreshCw className="size-3" />
              Retry
            </button>
          </div>
        ) : !walletAddress ? (
          <p className="text-xs text-muted-foreground italic">No wallet address linked to this account.</p>
        ) : (
          <div className="space-y-3">
            {/* Full key display */}
            <div className="flex items-stretch gap-2">
              <div className="flex-1 min-w-0 bg-background/70 backdrop-blur-sm border border-border rounded-lg px-3 py-2.5">
                {/* Full key on larger screens, truncated on mobile */}
                <p className="hidden sm:block text-xs font-mono text-foreground tracking-wide break-all leading-relaxed">
                  {walletAddress}
                </p>
                <p className="sm:hidden text-xs font-mono text-foreground tracking-wide">
                  {truncateKey(walletAddress)}
                </p>
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                aria-label={copied ? "Copied!" : "Copy public key"}
                title={copied ? "Copied!" : "Copy full public key"}
                className="shrink-0 flex items-center justify-center w-10 h-auto rounded-lg border border-border bg-background/70 hover:bg-muted transition-all active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <Copy className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </button>
            </div>

            {/* Meta info row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isStellar ? "bg-green-500" : "bg-yellow-500"}`} />
                <span className="text-[10px] text-muted-foreground font-medium">
                  {isStellar ? "Valid Stellar public key (G…)" : "Wallet address"}
                </span>
              </div>

              {isStellar && (
                <a
                  href={`https://stellar.expert/explorer/public/account/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-semibold text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                >
                  View on Stellar Expert
                  <ExternalLink className="size-2.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-muted-foreground/70 italic">
          Your Stellar public key can be safely shared. Never share your secret key.
        </p>
      </div>
    </div>
  );
}
