"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowUpFromLine, Package, AlertCircle, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ItemSearchSelect from '@/components/ItemSearchSelect';

interface Item {
    id: string;
    name: string;
    category: string;
    unit: string;
    current_stock: number;
    min_stock: number;
}

export default function OutboundPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [unitPrice, setUnitPrice] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        item_id: "",
        item_label: "",
        quantity: "",
        reason: "Usage",
        notes: "",
        pic: "",
    });

    useEffect(() => {
        async function fetchItems() {
            const { data } = await supabase.from('items').select('*').order('name');
            setItems(data || []);
            setLoadingItems(false);
        }
        fetchItems();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const fetchUnitPrice = async (itemId: string) => {
        if (!itemId) {
            setUnitPrice(null);
            return;
        }

        const { data } = await supabase
            .from('transactions')
            .select('price, quantity')
            .eq('item_id', itemId)
            .eq('type', 'in')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

        if (data && data.quantity > 0 && (data.price || 0) > 0) {
            setUnitPrice((data.price || 0) / data.quantity);
        } else {
            setUnitPrice(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        let calculatedPrice = null;
        if (unitPrice && Number(formData.quantity) > 0) {
            calculatedPrice = unitPrice * Number(formData.quantity);
        }

        const { error } = await supabase.from('transactions').insert([{
            item_id: formData.item_id,
            type: 'out',
            quantity: Number(formData.quantity),
            price: calculatedPrice,
            reason: formData.reason,
            notes: formData.notes,
            pic: formData.pic,
            timestamp: new Date().toISOString()
        }]);

        if (error) {
            toast.error("Gagal menyimpan data: " + error.message);
        } else {
            toast.success("Barang keluar berhasil disimpan ke database!");
            setFormData({
                item_id: "",
                item_label: "",
                quantity: "",
                reason: "Usage",
                notes: "",
                pic: "",
            });
            setUnitPrice(null);
        }
        setSubmitting(false);
    };

    const selectedItem = items.find((item) => item.id === formData.item_id);

    return (
        <div className="w-full space-y-6">
            <Toaster position="top-right" />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ArrowUpFromLine className="h-5 w-5" /></div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Catat Barang Keluar</h2>
                        <p className="text-sm text-gray-500">Log pemakaian atau barang rusak ke database.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Pilih Barang <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Package className="h-5 w-5 text-gray-400" /></div>
                                <ItemSearchSelect
                                    items={items}
                                    selectedId={formData.item_id}
                                    onSelect={(id, label) => {
                                        setFormData((prev) => ({ ...prev, item_id: id, item_label: label }));
                                        fetchUnitPrice(id);
                                    }}
                                    placeholder={loadingItems ? 'Memuat barang...' : 'Ketik untuk mencari barang...'}
                                    disabled={loadingItems}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Jumlah {selectedItem ? `(${selectedItem.unit})` : ""} <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={selectedItem?.current_stock}
                                    name="quantity"
                                    required
                                    placeholder="0.00"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl sm:text-sm text-gray-900 pr-12"
                                />
                                {selectedItem && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-xs">{selectedItem.unit}</span>
                                    </div>
                                )}
                            </div>
                            {unitPrice && formData.quantity && (
                                <p className="text-xs text-blue-600 font-medium pt-1">
                                    Est. Harga: Rp {(unitPrice * Number(formData.quantity)).toLocaleString("id-ID")}
                                    <span className="text-gray-400 font-normal ml-1">(@ Rp {Math.round(unitPrice).toLocaleString("id-ID")})</span>
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Jenis Keluar <span className="text-red-500">*</span></label>
                            <select name="reason" value={formData.reason} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl sm:text-sm text-gray-900">
                                <option value="Usage">Pemakaian Rutin</option>
                                <option value="Waste">Waste / Rusak</option>
                            </select>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="block text-sm font-medium text-gray-700">PIC (Petugas) <span className="text-red-500">*</span></label>
                            <input type="text" name="pic" required placeholder="Nama Petugas" value={formData.pic} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl sm:text-sm text-gray-900" />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Catatan {formData.reason === "Waste" && <span className="text-red-500">*</span>}</label>
                            <textarea name="notes" rows={2} required={formData.reason === "Waste"} placeholder="Keterangan tambahan..." value={formData.notes} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl sm:text-sm resize-none text-gray-900" />
                        </div>

                        {formData.reason === "Waste" && (
                            <div className="col-span-1 md:col-span-2 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">Anda memilih <strong>Waste</strong>. Pastikan alasan dicatat di bagian catatan.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                        >
                            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : 'Simpan Transaksi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
