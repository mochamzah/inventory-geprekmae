"use client";

import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import HistoryInboundPage from "./inbound/page";
import HistoryOutboundPage from "./outbound/page";

export default function HistoryPage() {
    const [view, setView] = useState<'all' | 'inbound' | 'outbound'>('all');

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <button
                    onClick={() => setView('inbound')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition ${view === 'inbound' ? 'bg-white ring-1 ring-green-200 shadow-sm' : 'bg-white/60 hover:bg-white'}`}>
                    <div className={`p-2 rounded-md ${view === 'inbound' ? 'bg-green-50 text-green-600' : 'bg-green-50 text-green-600'}`}>
                        <ArrowDownToLine className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <div className={`text-sm font-semibold ${view === 'inbound' ? 'text-gray-900' : 'text-gray-700'}`}>Riwayat Masuk</div>
                        <div className="text-xs text-gray-500">Log pembelian bahan baku</div>
                    </div>
                </button>

                <button
                    onClick={() => setView('outbound')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition ${view === 'outbound' ? 'bg-white ring-1 ring-red-200 shadow-sm' : 'bg-white/60 hover:bg-white'}`}>
                    <div className={`p-2 rounded-md ${view === 'outbound' ? 'bg-red-50 text-red-600' : 'bg-red-50 text-red-600'}`}>
                        <ArrowUpFromLine className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <div className={`text-sm font-semibold ${view === 'outbound' ? 'text-gray-900' : 'text-gray-700'}`}>Riwayat Keluar</div>
                        <div className="text-xs text-gray-500">Log pemakaian / waste</div>
                    </div>
                </button>

                <div className="flex items-center justify-end md:justify-center">
                    <button
                        onClick={() => setView('all')}
                        className={`px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50`}
                    >Tampilkan Semua</button>
                </div>
            </div>

            <div>
                {view === 'all' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <HistoryInboundPage />
                        <HistoryOutboundPage />
                    </div>
                )}

                {view === 'inbound' && (
                    <div>
                        <HistoryInboundPage />
                    </div>
                )}

                {view === 'outbound' && (
                    <div>
                        <HistoryOutboundPage />
                    </div>
                )}
            </div>
        </div>
    );
}
