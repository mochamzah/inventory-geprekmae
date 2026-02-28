"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Package, TrendingDown, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [itemsRes, transRes] = await Promise.all([
        supabase.from('items').select('*'),
        supabase.from('transactions').select('*, items(name, unit)').order('timestamp', { ascending: false }).limit(5)
      ]);
      setItems(itemsRes.data || []);
      setTransactions(transRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const lowStockItems = items.filter((item) => Number(item.current_stock) <= Number(item.min_stock));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
        <p className="text-gray-500 font-medium">Memuat Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Master Barang</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{items.length}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Package className="h-6 w-6" /></div>
        </div>

        <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-red-600">Low Stock Alert</p>
            <p className="text-3xl font-extrabold text-red-700 mt-1">{lowStockItems.length} <span className="text-lg font-medium">Items Kritis</span></p>
          </div>
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse"><AlertCircle className="h-6 w-6" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 col-span-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Stock Kritis
            </h2>
            <Link href="/items" className="text-sm text-red-600 hover:text-red-700 font-medium">Lihat Semua</Link>
          </div>
          <div className="space-y-4">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Semua stok aman.</p>
            ) : (
              lowStockItems.map((item) => {
                const isCritical = item.current_stock <= (item.min_stock / 2);
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Min: {item.min_stock} {item.unit}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${isCritical ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>{item.current_stock} {item.unit}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h2>
            <div className="text-sm font-medium text-gray-500 space-x-4">
              <Link href="/history/inbound" className="hover:text-gray-900">Masuk</Link>
              <Link href="/history/outbound" className="hover:text-gray-900">Keluar</Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium">Tipe</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t) => {
                  const isOut = t.type === 'out';
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 text-gray-900 font-medium">{t.items?.name || 'Unknown'}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isOut ? (t.reason === "Waste" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800") : "bg-green-100 text-green-800"}`}>
                          {isOut ? (t.reason === "Waste" ? "Waste" : "Usage") : "Inbound"}
                        </span>
                      </td>
                      <td className="py-3 text-gray-700">{isOut ? '-' : '+'}{t.quantity} {t.items?.unit}</td>
                      <td className="py-3 text-gray-400 text-right">{new Date(t.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
