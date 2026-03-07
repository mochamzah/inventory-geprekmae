"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ItemSearchSelect from '@/components/ItemSearchSelect';

interface Item {
    id: string;
    name: string;
    category: string;
    unit: string;
}

export default function InboundPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        item_id: "",
        item_label: "",
        quantity: "",
        price: "",
        supplier: "",
        notes: "",
        pic: "",
    });

    useEffect(() => {
        async function fetchItems() {
            const { data } = await supabase.from('items').select('id, name, category, unit').order('name');
            setItems(data || []);
            setLoadingItems(false);
        }
        fetchItems();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Treat `formData.price` as harga satuan (per unit). Store total price = harga_satuan * quantity.
        const qty = Number(formData.quantity) || 0;
        const unitPrice = Number(formData.price) || 0;
        const totalPrice = unitPrice * qty;

        const { error } = await supabase.from('transactions').insert([{
            item_id: formData.item_id,
            type: 'in',
            quantity: qty,
            price: totalPrice,
            supplier: formData.supplier,
            notes: formData.notes,
            pic: formData.pic,
            timestamp: new Date().toISOString()
        }]);

        if (error) {
            toast.error("Gagal menyimpan data: " + error.message);
        } else {
            toast.success("Barang masuk berhasil disimpan ke database!");
            setFormData({
                item_id: "",
                item_label: "",
                quantity: "",
                price: "",
                supplier: "",
                notes: "",
                pic: "",
            });
        }
        setSubmitting(false);
    };

    return (
        <div className="w-full space-y-6">
            <Toaster position="top-right" />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Form Pemasukan Barang</h2>
                    <p className="text-sm text-gray-500">Catat penambahan stok ke database Supabase.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex flex-col gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Pilih Barang <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Package className="h-5 w-5 text-gray-400" /></div>
                                <ItemSearchSelect
                                    items={items}
                                    selectedId={formData.item_id}
                                    onSelect={(id, label) => setFormData((prev) => ({ ...prev, item_id: id, item_label: label }))}
                                    placeholder={loadingItems ? 'Memuat barang...' : 'Ketik untuk mencari barang...'}
                                    disabled={loadingItems}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Jumlah <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input type="number" step="0.01" name="quantity" required placeholder="0" value={formData.quantity} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl sm:text-sm text-gray-900" />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-xs">
                                        {formData.item_id && items.find(i => i.id === formData.item_id)?.unit}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Harga Satuan (Rp) <span className="text-red-500">*</span></label>
                                <input type="number" name="price" required placeholder="Contoh: 5000" value={formData.price} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl sm:text-sm text-gray-900" />
                                <p className="text-xs text-gray-500">Masukkan harga per satuan (per Kg / per Liter / per Ekor). Total harga akan dihitung otomatis saat menyimpan.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Supplier</label>
                            <input type="text" name="supplier" placeholder="Nama Supplier" value={formData.supplier} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl sm:text-sm text-gray-900" />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">PIC (Petugas) <span className="text-red-500">*</span></label>
                            <input type="text" name="pic" required placeholder="Nama Petugas" value={formData.pic} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl sm:text-sm text-gray-900" />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Catatan</label>
                            <textarea name="notes" rows={2} placeholder="Keterangan tambahan..." value={formData.notes} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl sm:text-sm resize-none text-gray-900" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                        >
                            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
