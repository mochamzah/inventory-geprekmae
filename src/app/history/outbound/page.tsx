"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, ArrowUpFromLine, Calendar as CalendarIcon, Loader2 } from "lucide-react";

export default function HistoryOutboundPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("all");

    useEffect(() => {
        fetchTransactions();
    }, [dateFilter]);

    async function fetchTransactions() {
        setLoading(true);
        let query = supabase
            .from('transactions')
            .select('*, items(name, unit)')
            .eq('type', 'out')
            .order('timestamp', { ascending: false });

        const now = new Date();
        if (dateFilter === 'today') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            query = query.gte('timestamp', today);
        } else if (dateFilter === 'week') {
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            query = query.gte('timestamp', lastWeek);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching transactions:', error);
        } else {
            setTransactions(data || []);
        }
        setLoading(false);
    }

    const filteredTransactions = transactions.filter((t) => {
        const searchMatch =
            t.items?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.pic?.toLowerCase().includes(searchTerm.toLowerCase());

        return searchMatch;
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl"><ArrowUpFromLine className="h-6 w-6" /></div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Riwayat Keluar</h1>
                        <p className="text-sm text-gray-500">Log pemakaian bahan dari database Supabase.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm"
                            placeholder="Cari barang, catatan, PIC..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:w-40">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarIcon className="h-4 w-4 text-gray-400" /></div>
                        <select
                            className="block w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm appearance-none"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="all">Semua Waktu</option>
                            <option value="today">Hari Ini</option>
                            <option value="week">Minggu Ini</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Barang</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Satuan</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">PIC (Petugas)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-red-500" />Memuat data riwayat...</td></tr>
                            ) : filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="text-gray-900 font-medium">{new Date(t.timestamp).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        <div className="text-xs text-gray-400 mt-1">{new Date(t.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{t.items?.name || 'Unknown'}</div>
                                        {t.reason === "Waste" && <div className="text-xs text-red-500 mt-1 font-medium">Waste</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-extrabold text-red-600 bg-red-50 inline-block px-2.5 py-1 rounded-lg">-{t.quantity}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.items?.unit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-700">{t.pic}</span>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredTransactions.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">Tidak ada riwayat barang keluar yang ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
