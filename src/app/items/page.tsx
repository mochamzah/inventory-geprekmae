"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Plus, AlertCircle, Edit, Trash2, Loader2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Item {
    id: string;
    name: string;
    category: string;
    unit: string;
    min_stock: number;
    current_stock: number;
}

interface Transaction {
    item_id: string;
    type: string;
    quantity: number;
    price: number | null;
}

export default function MasterItemsPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        unit: "",
        min_stock: "0",
        current_stock: "0"
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const [itemsRes, transRes] = await Promise.all([
            supabase.from('items').select('*').order('name', { ascending: true }),
            supabase.from('transactions').select('item_id, type, quantity, price').eq('type', 'in')
        ]);

        if (itemsRes.error) console.error('Error fetching items:', itemsRes.error);
        if (transRes.error) console.error('Error fetching transactions:', transRes.error);

        setItems(itemsRes.data || []);
        setTransactions(transRes.data || []);
        setLoading(false);
    }

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (item?: Item) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                category: item.category,
                unit: item.unit,
                min_stock: item.min_stock.toString(),
                current_stock: item.current_stock.toString()
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: "",
                category: "",
                unit: "",
                min_stock: "0",
                current_stock: "0"
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            name: formData.name,
            category: formData.category,
            unit: formData.unit,
            min_stock: Number(formData.min_stock),
            current_stock: Number(formData.current_stock)
        };

        let error;
        if (editingItem) {
            const { error: err } = await supabase
                .from('items')
                .update(payload)
                .eq('id', editingItem.id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('items')
                .insert([payload]);
            error = err;
        }

        if (error) {
            toast.error("Gagal menyimpan: " + error.message);
        } else {
            toast.success(editingItem ? "Barang berhasil diperbarui!" : "Barang baru berhasil ditambahkan!");
            handleCloseModal();
            fetchData();
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus "${name}"? Semua data transaksi terkait juga akan dihapus.`)) {
            const { error } = await supabase.from('items').delete().eq('id', id);
            if (error) {
                toast.error("Gagal menghapus: " + error.message);
            } else {
                toast.success("Barang berhasil dihapus!");
                fetchData();
            }
        }
    };

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1 w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm transition-shadow"
                        placeholder="Cari barang..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Tambah Barang Baru
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Barang</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stok</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga Rata-Rata</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Stok</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
                                            <p className="text-sm text-gray-500 font-medium">Memuat data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.map((item) => {
                                const isLowStock = item.current_stock <= item.min_stock;
                                const itemInbounds = transactions.filter(t => t.item_id === item.id);
                                const totalValue = itemInbounds.reduce((sum, t) => sum + (t.price || 0), 0);
                                const totalQty = itemInbounds.reduce((sum, t) => sum + Number(t.quantity), 0);
                                const avgPrice = totalQty > 0 ? (totalValue / totalQty) : 0;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                            <div className="text-xs text-gray-500">ID: {item.id.substring(0, 8)}...</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">{item.category}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>{item.current_stock} {item.unit}</span>
                                                {isLowStock && <AlertCircle className="h-4 w-4 text-red-500" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">{avgPrice > 0 ? `Rp ${Math.round(avgPrice).toLocaleString("id-ID")}` : "-"}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.min_stock} {item.unit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => handleOpenModal(item)} className="text-gray-400 hover:text-blue-600 transition-colors"><Edit className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(item.id, item.name)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">{editingItem ? "Edit Barang" : "Tambah Barang Baru"}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Nama Barang</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-red-500 outline-none transition-shadow" placeholder="Contoh: Ayam Broiler" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Kategori</label>
                                    <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-red-500 outline-none">
                                        <option value="">Pilih...</option>
                                        <option value="Daging">Daging</option>
                                        <option value="Sayuran">Sayuran</option>
                                        <option value="Sembako">Sembako</option>
                                        <option value="Packaging">Packaging</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Satuan</label>
                                    <input type="text" name="unit" required value={formData.unit} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Kg / Ekor / Liter" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Stok Awal</label>
                                    <input type="number" name="current_stock" required value={formData.current_stock} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Min. Stok</label>
                                    <input type="number" name="min_stock" required value={formData.min_stock} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={handleCloseModal} className="flex-1 py-2 border rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50">
                                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
