"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ListFilter, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    totalCount: number;
    dateFrom?: string;
    dateTo?: string;
    onDateFromChange?: (date: string) => void;
    onDateToChange?: (date: string) => void;
    onClearDateRange?: () => void;
    onExportCSV?: () => void;
}

const filters = ["All", "Deposit", "Withdrawal", "Convert"];

export function TransactionFilters({
    searchQuery,
    onSearchChange,
    activeFilter,
    onFilterChange,
    totalCount,
    dateFrom = "",
    dateTo = "",
    onDateFromChange,
    onDateToChange,
    onClearDateRange,
    onExportCSV,
}: TransactionFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-col gap-4 py-4">
            {/* Top Controls: Search, Date Range, Export */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search & Dates Container */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="flex h-10 w-full rounded-[10px] border border-border bg-background px-3 pl-9 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
                        />
                    </div>

                    {/* Date Inputs */}
                    {onDateFromChange && onDateToChange && (
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">From</span>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => onDateFromChange(e.target.value)}
                                    className="flex h-10 w-full sm:w-auto rounded-[10px] border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-shadow"
                                />
                            </div>
                            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">To</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => onDateToChange(e.target.value)}
                                    className="flex h-10 w-full sm:w-auto rounded-[10px] border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-shadow"
                                />
                            </div>
                            {(dateFrom || dateTo) && onClearDateRange && (
                                <button
                                    onClick={onClearDateRange}
                                    className="h-10 px-3 flex items-center justify-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-[10px] transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Export Button */}
                {onExportCSV && (
                    <button
                        onClick={onExportCSV}
                        disabled={totalCount === 0}
                        className="flex cursor-pointer items-center justify-center gap-2 h-10 rounded-[10px] bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
                    >
                        <Download className="size-4" />
                        Export CSV
                    </button>
                )}
            </div>

            {/* Bottom Controls: Type Filter Tabs */}
            <div className="flex items-center justify-between border-t border-border/50 pt-4">
                <div className="flex items-center shrink-0 w-full md:w-auto">
                    {/* Desktop Tabs */}
                    <div className="hidden md:flex items-center border border-border rounded-[10px] overflow-hidden bg-card shadow-sm">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => onFilterChange(filter)}
                                className={cn(
                                    "relative px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-25 text-center cursor-pointer",
                                    activeFilter === filter || (filter === "All" && activeFilter === "All")
                                        ? "bg-primary text-primary-foreground rounded-[10px] font-semibold"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                )}
                            >
                                {filter}
                                {filter === "All" && (
                                    <span className={cn(
                                        "ml-1.5 px-1.5 py-0.5 text-xs rounded-full",
                                        activeFilter === "All"
                                            ? "bg-primary-foreground/20 text-primary-foreground font-semibold"
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {totalCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Dropdown */}
                    <div className="md:hidden flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-[10px] text-sm font-medium shadow-sm whitespace-nowrap">
                                <span>{activeFilter}</span>
                                <span className="opacity-80 text-xs">{totalCount}</span>
                            </div>
                        </div>

                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2.5 bg-muted text-foreground hover:bg-muted/80 transition-colors rounded-[10px]"
                                aria-label="Filter options"
                            >
                               <ListFilter className="h-5 w-5" />
                            </button>

                            {isOpen && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
                                    <div className="py-1">
                                        {filters.map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => {
                                                    onFilterChange(filter);
                                                    setIsOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-muted cursor-pointer",
                                                    activeFilter === filter ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{filter}</span>
                                                    {filter === "All" && <span className="text-xs text-muted-foreground">{totalCount}</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}