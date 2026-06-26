"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, PencilLine, CircleUserRound } from "lucide-react";
import { getProfile, type UserProfile } from "@/lib/api/users";

function truncateAddress(addr: string, front = 6, back = 4): string {
  if (addr.length <= front + back + 3) return addr;
  return `${addr.slice(0, front)}...${addr.slice(-back)}`;
}

export function InfoAvatar() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((err) => console.error("Failed to load profile in InfoAvatar:", err));
  }, []);

  const handleCopyAddress = async () => {
    const addr = profile?.walletAddress;
    if (!addr) return;
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available in all environments
    }
  };

  const displayName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || profile.email?.split("@")[0] || "User"
    : "Loading...";

  const walletDisplay = profile?.walletAddress
    ? truncateAddress(profile.walletAddress)
    : profile === null
    ? "Loading..."
    : "No wallet linked";

  const isVerified = profile?.isVerified ?? false;

  return (
    <div className="sm:py-8.75 p-3.75 sm:px-5 flex flex-col sm:flex-row items-start justify-between sm:items-center rounded-2xl border-[#E58600] bg-[linear-gradient(83.78deg,rgba(255,162,0,0.3)_-29.73%,rgba(59,130,246,0.3)_143.83%)] border-[0.5px]">
      <div className="flex flex-col">
        <div className="flex gap-4">
          <CircleUserRound className="w-[70px] h-[68px] text-muted-foreground" />
          <div className="flex flex-col justify-between sm:flex-row sm:items-center">
            <div className="flex gap-2 items-center">
              <h3 className="font-semibold text-[19px] sm:text-2xl">{displayName}</h3>
              <PencilLine className="size-4 cursor-pointer" />
            </div>

            {/* Mobile: wallet address */}
            <div className="sm:hidden flex gap-2.5 items-center text-[14px] font-medium">
              Wallet: {walletDisplay}
              {profile?.walletAddress && (
                <button
                  onClick={handleCopyAddress}
                  aria-label={copied ? "Copied!" : "Copy wallet address"}
                  className="cursor-pointer"
                >
                  {copied ? (
                    <Check className="size-3 text-green-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: wallet address */}
        <div className="max-sm:hidden flex gap-2.5 items-center mt-4 text-[14px] font-medium">
          Wallet: {walletDisplay}
          {profile?.walletAddress && (
            <button
              onClick={handleCopyAddress}
              aria-label={copied ? "Copied!" : "Copy wallet address"}
              className="cursor-pointer"
            >
              {copied ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4 cursor-pointer max-sm:size-2.5" />
              )}
            </button>
          )}
        </div>
      </div>

      <button
        className={cn(
          "max-sm:mt-4 rounded-[35px] border h-8 sm:h-11 px-7 cursor-pointer text-[14px] font-semibold",
          !isVerified
            ? "border-[#E58600] bg-[#E5860033]"
            : "bg-[#3b82f61a] border-[#3B82F6]",
        )}
      >
        {isVerified ? "Verified ID" : "Unverified ID"}
      </button>
    </div>
  );
}
