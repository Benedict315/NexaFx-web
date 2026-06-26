"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Landmark, RefreshCw } from "lucide-react";
import { getAdminMetrics, type AdminMetrics } from "@/lib/api/admin";

/**
 * Confirmed Backend Endpoint Behavior:
 * 1. We probed the backend endpoints (`https://nexafx-backend.onrender.com/v1`) and confirmed:
 *    - `GET /admin/metrics` exists (returns 401 Unauthorized / 200).
 *    - `GET /admin/revenue` and time-series endpoints (`/admin/revenue/time-series`, etc.) return 404 Not Found.
 * 2. Therefore, no time-series endpoint is currently supported by the backend.
 * 3. As required by the fallback instructions:
 *    - We render the summary metrics from `GET /admin/metrics` as stat cards only.
 *    - We do NOT generate fake/mock data to fill the chart.
 *    - We include clearly visible `// TODO: Wire to time-series endpoint once available` comments.
 */

export function RevenueChart() {
    const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAdminMetrics();
            setMetrics(data);
        } catch (err: unknown) {
            console.error("Error loading admin metrics for chart fallback:", err);
            setError(err instanceof Error ? err.message : "Failed to load metrics data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl flex-1 min-w-0 min-h-[253px] py-4 px-5 border border-gray-200 flex flex-col justify-between animate-pulse">
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 grow mt-4">
                    <div className="h-full min-h-[140px] bg-gray-100 rounded-xl" />
                    <div className="h-full min-h-[140px] bg-gray-100 rounded-xl" />
                    <div className="h-full min-h-[140px] bg-gray-100 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="bg-white rounded-2xl flex-1 min-w-0 min-h-[253px] py-5 px-5 border border-gray-200 flex flex-col items-center justify-center gap-3">
                <p className="text-sm text-red-500 font-medium">Failed to load revenue metrics</p>
                <p className="text-xs text-gray-400 max-w-xs text-center">{error}</p>
                <button
                    onClick={fetchMetrics}
                    className="flex items-center gap-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                >
                    <RefreshCw size={12} />
                    Retry
                </button>
            </div>
        );
    }

    const netVolume = metrics.totalDeposits - metrics.totalWithdrawals;

    return (
        <div className="bg-white rounded-2xl flex-1 min-w-0 min-h-[253px] py-4 px-5 border border-gray-200 flex flex-col justify-between gap-3">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                    <h3 className="text-base font-bold text-gray-900">Revenue Summary</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Real-time volume metrics from GET /admin/metrics</p>
                </div>
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Fallback View
                </span>
            </div>

            {/* TODO: Wire to time-series endpoint once available */}
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 grow mt-2">
                {/* Total Deposits Card */}
                <div className="bg-green-50/40 hover:bg-green-50/70 border border-green-100/60 rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">Deposits</span>
                        <div className="p-1.5 bg-green-100/80 rounded-lg text-green-600">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-xl md:text-2xl font-bold text-gray-950">{formatCurrency(metrics.totalDeposits)}</p>
                        <p className="text-[10px] text-green-600 mt-0.5 font-medium font-mono">Total platform deposits</p>
                    </div>
                </div>

                {/* Total Withdrawals Card */}
                <div className="bg-red-50/40 hover:bg-red-50/70 border border-red-100/60 rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Withdrawals</span>
                        <div className="p-1.5 bg-red-100/80 rounded-lg text-red-600">
                            <TrendingDown size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-xl md:text-2xl font-bold text-gray-950">{formatCurrency(metrics.totalWithdrawals)}</p>
                        <p className="text-[10px] text-red-600 mt-0.5 font-medium font-mono">Total platform withdrawals</p>
                    </div>
                </div>

                {/* Net Volume Card */}
                <div className="bg-blue-50/40 hover:bg-blue-50/70 border border-blue-100/60 rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Net Volume</span>
                        <div className="p-1.5 bg-blue-100/80 rounded-lg text-blue-600">
                            <Landmark size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-xl md:text-2xl font-bold text-gray-950">{formatCurrency(netVolume)}</p>
                        <p className="text-[10px] text-blue-600 mt-0.5 font-medium font-mono">Net transaction volume</p>
                    </div>
                </div>
            </div>

            {/* TODO: Wire to time-series endpoint once available */}
            <div className="text-[10px] text-gray-400 italic text-right mt-1">
                Time-series endpoint pending backend support
            </div>
        </div>
    );
}
