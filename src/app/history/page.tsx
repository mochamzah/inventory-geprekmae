"use client";

import { useState, useEffect } from "react";
import { ArrowDownToLine, ArrowUpFromLine, LayoutGrid, Download, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { exportToCsv, formatDateForCsv, formatCurrencyForCsv } from "@/lib/exportCsv";
import HistoryInboundPage from "./inbound/page";
import HistoryOutboundPage from "./outbound/page";

export default function HistoryPage() {
    const [view, setView] = useState<'all' | 'inbound' | 'outbound'>('inbound');
    const [exporting, setExporting] = useState(false);

    async function handleExportAll() {
        setExporting(true);
        try {
            // Determine which types to export based on current view
            const types = view === 'all' ? ['in', 'out'] : view === 'inbound' ? ['in'] : ['out'];

            const allRows: (string | number)[][] = [];
            const headers = ['Tipe', 'Tanggal', 'Nama Barang', 'Jumlah', 'Nominal (Rp)', 'Satuan', 'Supplier/Penggunaan', 'PIC'];

            for (const type of types) {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*, items(name, unit)')
                    .eq('type', type)
                    .order('timestamp', { ascending: false });

                if (error) {
                    console.error('Export error:', error);
                    continue;
                }

                (data || []).forEach((t: any) => {
                    const usage = type === 'out'
                        ? (t.usage || (t.reason === 'Waste' ? 'Waste' : 'Produksi'))
                        : (t.supplier || '-');
                    allRows.push([
                        type === 'in' ? 'Masuk' : 'Keluar',
                        formatDateForCsv(t.timestamp),
                        t.items?.name || 'Unknown',
                        type === 'in' ? `+${t.quantity}` : `-${t.quantity}`,
                        formatCurrencyForCsv(t.price),
                        t.items?.unit || '',
                        usage,
                        t.pic || '-',
                    ]);
                });
            }

            const now = new Date();
            const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
            const viewLabel = view === 'all' ? 'Semua' : view === 'inbound' ? 'Masuk' : 'Keluar';
            const filename = `Riwayat-${viewLabel}_Export_${dateStr}.csv`;

            // Add summary
            const totalIn = allRows.filter(r => r[0] === 'Masuk').length;
            const totalOut = allRows.filter(r => r[0] === 'Keluar').length;
            allRows.push([]);
            allRows.push(['RINGKASAN', '', '', '', '', '', '', '']);
            if (view === 'all' || view === 'inbound') {
                allRows.push(['Total Transaksi Masuk', totalIn, '', '', '', '', '', '']);
            }
            if (view === 'all' || view === 'outbound') {
                allRows.push(['Total Transaksi Keluar', totalOut, '', '', '', '', '', '']);
            }

            exportToCsv(filename, headers, allRows);
        } catch (err) {
            console.error('Export failed:', err);
        }
        setExporting(false);
    }

    return (
        <div className="space-y-6">
            {/* Tab Selector + Export */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-wrap gap-2 items-center">
                <button
                    onClick={() => setView('inbound')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${view === 'inbound'
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}>
                    <ArrowDownToLine className="h-4 w-4" />
                    <span>Riwayat Masuk</span>
                </button>

                <button
                    onClick={() => setView('outbound')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${view === 'outbound'
                        ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}>
                    <ArrowUpFromLine className="h-4 w-4" />
                    <span>Riwayat Keluar</span>
                </button>

                <button
                    onClick={() => setView('all')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${view === 'all'
                        ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}>
                    <LayoutGrid className="h-4 w-4" />
                    <span>Tampilkan Semua</span>
                </button>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1"></div>

                {/* Global Export Button */}
                <button
                    onClick={handleExportAll}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-wait flex-shrink-0"
                >
                    {exporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{exporting ? 'Mengunduh...' : 'Download Semua'}</span>
                </button>
            </div>

            {/* Content */}
            <div>
                {view === 'all' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <HistoryInboundPage />
                        <HistoryOutboundPage />
                    </div>
                )}

                {view === 'inbound' && (
                    <HistoryInboundPage />
                )}

                {view === 'outbound' && (
                    <HistoryOutboundPage />
                )}
            </div>
        </div>
    );
}
