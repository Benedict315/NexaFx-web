"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChevronDown, AlertCircle, DollarSign, RefreshCw, ArrowUpRight } from "lucide-react";
import { getAdminMetrics, getRevenueTimeSeries, type AdminMetrics, type RevenueDataPoint } from "@/lib/api/admin";

/**
 * CONFIRMED ENDPOINT STATUS (Issue #260):
 * - GET /admin/metrics: Active, returns flat summary metrics only.
 * - GET /admin/revenue: 404 Not Found.
 * - GET /admin/revenue/time-series: 404 Not Found.
 * - GET /admin/metrics/time-series: 404 Not Found.
 * 
 * Outcome: No backend time-series endpoint exists.
 * Per acceptance criteria, we show the summary metrics from GET /admin/metrics as stat cards
 * and include a clear // TODO comment. The chart implementation is kept for when the endpoint becomes active.
 */

export function RevenueChart() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [timeSeriesData, setTimeSeriesData] = useState<RevenueDataPoint[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch both metrics and time-series data
        const [fetchedTimeSeries, fetchedMetrics] = await Promise.all([
          getRevenueTimeSeries(period),
          getAdminMetrics(),
        ]);

        setTimeSeriesData(fetchedTimeSeries);
        setMetrics(fetchedMetrics);
      } catch (err: unknown) {
        console.error("Error fetching revenue/metrics data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [period]);

  // Skeleton Loader State
  if (loading) {
    return (
      <div className="bg-white rounded-2xl flex-1 min-w-0 h-[253px] py-4 px-6 border border-gray-200 flex flex-col justify-between animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-5 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-28 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 flex-1 mt-4">
          <div className="h-full bg-gray-100 rounded-xl"></div>
          <div className="h-full bg-gray-100 rounded-xl"></div>
          <div className="h-full bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-2xl flex-1 min-w-0 h-[253px] py-4 px-6 border border-red-100 flex flex-col justify-center items-center text-center gap-2">
        <AlertCircle className="text-red-500" size={32} />
        <h4 className="font-semibold text-gray-900">Failed to load revenue data</h4>
        <p className="text-xs text-gray-500 max-w-xs">{error}</p>
      </div>
    );
  }

  // If NO time-series data exists, fallback to rendering GET /admin/metrics as stat cards only
  const hasTimeSeriesData = timeSeriesData && timeSeriesData.length > 0;

  if (!hasTimeSeriesData) {
    // TODO: Wire to time-series endpoint once available (e.g. GET /admin/revenue)
    // Currently, we render the summary metrics from GET /admin/metrics as stat cards only.
    return (
      <div className="bg-white rounded-2xl flex-1 min-w-0 h-[253px] py-4 px-6 border border-gray-200 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 mb-2">
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-gray-900">Revenue Summary</h3>
            <span className="text-[10px] text-orange-500 font-medium tracking-wide uppercase bg-orange-50 px-2 py-0.5 rounded-full w-fit mt-1">
              Time-series offline — showing summary
            </span>
          </div>
          {/* Period selector (shown but disabled / configured to explain status) */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-100 rounded-lg px-2.5 py-1.5 cursor-not-allowed">
              Period: {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              <ChevronDown size={12} />
            </button>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 mt-1">
          {/* Total Deposits Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Total Deposits</span>
              <div className="p-1 bg-emerald-500 text-white rounded-lg">
                <DollarSign size={14} />
              </div>
            </div>
            <div className="mt-2">
              <h4 className="text-xl font-bold text-gray-900 leading-none">
                ₦{(metrics?.totalDeposits ?? 0).toLocaleString()}
              </h4>
              <p className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-0.5">
                <ArrowUpRight size={10} /> Active platform inflow
              </p>
            </div>
          </div>

          {/* Total Withdrawals Card */}
          <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Total Withdrawals</span>
              <div className="p-1 bg-rose-500 text-white rounded-lg">
                <RefreshCw size={14} />
              </div>
            </div>
            <div className="mt-2">
              <h4 className="text-xl font-bold text-gray-900 leading-none">
                ₦{(metrics?.totalWithdrawals ?? 0).toLocaleString()}
              </h4>
              <p className="text-[10px] text-rose-700 font-medium mt-1 flex items-center gap-0.5">
                Processed withdrawal requests
              </p>
            </div>
          </div>

          {/* Registered Users & Transactions combined Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Platform Activity</span>
              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                Live
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Total Transactions:</span>
                <span className="font-bold text-gray-900">{(metrics?.totalTransactions ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Registered Users:</span>
                <span className="font-bold text-gray-900">{(metrics?.registeredUsers ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Pending KYC:</span>
                <span className="font-bold text-orange-600 font-semibold">{(metrics?.pendingKyc ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Real Recharts Time-Series Chart Rendering ---
  // (This will be active if the backend endpoint is wired up and returns time-series data)
  
  // Format period options
  const periods = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
  ] as const;

  const yAxisTicks = [0, 10000, 30000, 50000, 100000];

  function formatYAxis(value: number) {
    if (value === 0) return "₦0K";
    return `₦${value / 1000}K`;
  }

  return (
    <div className="bg-white rounded-2xl flex-1 min-w-0 h-[253px] py-4 px-6 border border-gray-200 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Revenue Time-Series</h3>
          <span className="text-xs text-gray-500">Transaction volumes and counts</span>
        </div>
        <div className="flex gap-1.5 border border-gray-100 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                period === p.key
                  ? "bg-orange-500 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={timeSeriesData}
            barSize={24}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#9CA3AF" }}
              dy={6}
              tickFormatter={(dateStr: string) => {
                try {
                  const d = new Date(dateStr);
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                } catch {
                  return dateStr;
                }
              }}
            />
            <YAxis
              ticks={yAxisTicks}
              tickFormatter={formatYAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#9CA3AF" }}
              width={36}
            />
            <Tooltip
              cursor={{ fill: "rgba(249, 115, 22, 0.05)" }}
              content={({ active, payload }: { active?: boolean; payload?: { payload: RevenueDataPoint }[] }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm text-xs space-y-1">
                      <p className="font-semibold text-gray-900">
                        {new Date(data.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <div className="h-px bg-gray-100 my-1" />
                      <p className="text-gray-500">
                        Volume: <span className="font-bold text-gray-950">₦{data.volume.toLocaleString()}</span>
                      </p>
                      <p className="text-gray-500">
                        Transactions: <span className="font-bold text-gray-950">{data.count}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="volume" radius={[4, 4, 0, 0]} fill="#F97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
