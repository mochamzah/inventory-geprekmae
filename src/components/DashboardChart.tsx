"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from "recharts";
import { Loader2, CalendarDays } from "lucide-react";

interface ChartDataPoint {
    date: string;
    label: string;
    inbound: number;
    usage: number;
    waste: number;
}

// Custom tooltip for Indonesian Rupiah formatting
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const fmt = (v: number) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);
    return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200 text-sm">
            <p className="font-semibold text-gray-800 mb-2">{label}</p>
            {payload.map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-2 py-0.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-600">{entry.name}:</span>
                    <span className="font-bold text-gray-900">{fmt(entry.value)}</span>
                </div>
            ))}
        </div>
    );
};

export default function DashboardChart() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<"7" | "14" | "30">("7");

    useEffect(() => {
        fetchTransactions();
    }, [range]);

    async function fetchTransactions() {
        setLoading(true);
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - Number(range));

        const { data, error } = await supabase
            .from("transactions")
            .select("type, price, reason, timestamp")
            .gte("timestamp", daysAgo.toISOString())
            .order("timestamp", { ascending: true });

        if (error) console.error("Chart fetch error:", error);
        setTransactions(data || []);
        setLoading(false);
    }

    const chartData: ChartDataPoint[] = useMemo(() => {
        const grouped: Record<string, { inbound: number; usage: number; waste: number }> = {};

        // Pre-fill all days in the range
        const days = Number(range);
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            grouped[key] = { inbound: 0, usage: 0, waste: 0 };
        }

        transactions.forEach((t) => {
            const day = new Date(t.timestamp).toISOString().slice(0, 10);
            if (!grouped[day]) grouped[day] = { inbound: 0, usage: 0, waste: 0 };
            const price = Number(t.price) || 0;

            if (t.type === "in") {
                grouped[day].inbound += price;
            } else if (t.type === "out") {
                if (t.reason === "Waste") {
                    grouped[day].waste += price;
                } else {
                    grouped[day].usage += price;
                }
            }
        });

        return Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, vals]) => ({
                date,
                label: new Date(date + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
                ...vals,
            }));
    }, [transactions, range]);

    const totals = useMemo(() => {
        return chartData.reduce(
            (acc, d) => ({
                inbound: acc.inbound + d.inbound,
                usage: acc.usage + d.usage,
                waste: acc.waste + d.waste,
            }),
            { inbound: 0, usage: 0, waste: 0 }
        );
    }, [chartData]);

    const fmt = (v: number) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-indigo-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Ringkasan Nominal</h2>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                    {(["7", "14", "30"] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${range === r
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {r} Hari
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-200/50">
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Barang Masuk</p>
                    <p className="text-xl font-bold text-emerald-700 mt-1">{fmt(totals.inbound)}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Pemakaian</p>
                    <p className="text-xl font-bold text-blue-700 mt-1">{fmt(totals.usage)}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-4 rounded-xl border border-rose-200/50">
                    <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Waste</p>
                    <p className="text-xl font-bold text-rose-700 mt-1">{fmt(totals.waste)}</p>
                </div>
            </div>

            {/* Chart */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                    <p className="text-sm text-gray-500">Memuat grafik...</p>
                </div>
            ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                    Tidak ada data transaksi dalam {range} hari terakhir.
                </div>
            ) : (
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barGap={2} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : v}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                            />
                            <Bar dataKey="inbound" name="Barang Masuk" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="usage" name="Pemakaian" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="waste" name="Waste" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
