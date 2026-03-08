"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Search, ArrowUpFromLine, Calendar as CalendarIcon, Loader2, Calculator, BadgeDollarSign, Download } from "lucide-react";
import { exportToCsv, formatDateForCsv, formatCurrencyForCsv, getPeriodLabel } from "@/lib/exportCsv";

export default function HistoryOutboundPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter states
    const [dateFilter, setDateFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        // Prevent fetching if 'custom' is selected but both dates are not provided
        if (dateFilter === 'custom' && (!startDate || !endDate)) {
            return;
        }
        fetchTransactions();
    }, [dateFilter, startDate, endDate]);

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
        } else if (dateFilter === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            query = query.gte('timestamp', startOfMonth);
        } else if (dateFilter === 'custom' && startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            query = query.gte('timestamp', start.toISOString()).lte('timestamp', end.toISOString());
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

    const totalQuantity = useMemo(() => {
        return filteredTransactions.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
    }, [filteredTransactions]);

    const totalNominal = useMemo(() => {
        return filteredTransactions.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
    }, [filteredTransactions]);

    function handleExportCsv() {
        let period = getPeriodLabel(dateFilter);
        if (dateFilter === 'custom' && startDate && endDate) {
            period = `${startDate}_sd_${endDate}`;
        }
        const filename = `Riwayat-Keluar_${period}.csv`;
        const headers = ['Tanggal', 'Nama Barang', 'Jumlah Keluar', 'Nominal Beban (Rp)', 'Satuan', 'Penggunaan', 'PIC'];
        const rows = filteredTransactions.map((t) => {
            const usage = t.usage || (t.reason === 'Waste' ? 'waste' : 'produksi');
            return [
                formatDateForCsv(t.timestamp),
                t.items?.name || 'Unknown',
                t.quantity,
                formatCurrencyForCsv(t.price),
                t.items?.unit || '',
                usage === 'waste' ? 'Waste' : 'Produksi',
                t.pic || '-',
            ];
        });

        // Add summary row
        rows.push([]);
        rows.push(['TOTAL', '', totalQuantity, formatCurrencyForCsv(totalNominal), '', '', '']);

        exportToCsv(filename, headers, rows);
    }

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl flex-shrink-0"><ArrowUpFromLine className="h-5 w-5" /></div>
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-gray-900 truncate">Riwayat Keluar</h1>
                            <p className="text-xs text-gray-500">Log pemakaian bahan / waste</p>
                        </div>
                    </div>
                    <button
                        onClick={handleExportCsv}
                        disabled={loading || filteredTransactions.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:from-red-600 hover:to-rose-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm flex-shrink-0"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Simpan CSV</span>
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            placeholder="Cari barang, catatan, PIC..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:w-44 flex-shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarIcon className="h-4 w-4 text-gray-400" /></div>
                        <select
                            className="block w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm appearance-none"
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                if (e.target.value !== 'custom') {
                                    setStartDate('');
                                    setEndDate('');
                                }
                            }}
                        >
                            <option value="all">Semua Waktu</option>
                            <option value="today">Hari Ini</option>
                            <option value="week">Minggu Ini</option>
                            <option value="month">Bulan Ini</option>
                            <option value="custom">Pilih Tanggal</option>
                        </select>
                    </div>
                </div>
            </div>

            {dateFilter === 'custom' && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm font-medium text-gray-600">Dari:</span>
                        <input
                            type="date"
                            className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm font-medium text-gray-600">Sampai:</span>
                        <input
                            type="date"
                            className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                        <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Kuantitas Keluar (Pcs/Kg/Liter)</p>
                        <p className="text-2xl font-bold text-gray-900">{totalQuantity.toLocaleString("id-ID")}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                        <BadgeDollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Nominal Produksi (Rp)</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalNominal)}
                        </p>
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
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah Keluar</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nominal Beban (Rp)</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Satuan</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Penggunaan</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">PIC (Petugas)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-red-500" />Memuat data riwayat...</td></tr>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {t.price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(t.price) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.items?.unit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {(() => {
                                            const usage = t.usage || (t.reason === 'Waste' ? 'waste' : 'produksi');
                                            return usage === 'waste' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700">Waste</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700">Produksi</span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-700">{t.pic}</span>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredTransactions.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">Tidak ada riwayat barang keluar yang ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
