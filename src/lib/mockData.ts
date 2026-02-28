export interface Item {
    id: string;
    name: string;
    category: string;
    unit: string;
    min_stock: number;
    current_stock: number;
}

export interface Transaction {
    id: string;
    item_id: string;
    type: 'in' | 'out';
    quantity: number;
    price?: number;
    timestamp: string;
    supplier?: string;
    reason?: string;
    notes: string;
    pic?: string;
}

export const mockItems: Item[] = [
    { id: '1', name: 'Ayam Broiler', category: 'Daging', unit: 'Ekor', min_stock: 10, current_stock: 5 },
    { id: '2', name: 'Cabai Domba', category: 'Sayuran', unit: 'Kg', min_stock: 2, current_stock: 5.5 },
    { id: '3', name: 'Minyak Goreng', category: 'Sembako', unit: 'Liter', min_stock: 10, current_stock: 45 },
    { id: '4', name: 'Box Takeaway', category: 'Packaging', unit: 'Pcs', min_stock: 100, current_stock: 85 },
];

export const mockTransactions: Transaction[] = [
    { id: 't1', item_id: '1', type: 'in', quantity: 50, price: 35000, timestamp: '2026-02-27T08:00:00Z', supplier: 'Supplier Ayam Mandiri', notes: 'Pengiriman pagi', pic: 'Dodi' },
    { id: 't2', item_id: '1', type: 'out', quantity: 20, timestamp: '2026-02-27T10:00:00Z', reason: 'Usage', notes: 'Produksi batch 1', pic: 'Siti' },
    { id: 't3', item_id: '1', type: 'out', quantity: 25, timestamp: '2026-02-27T14:00:00Z', reason: 'Usage', notes: 'Produksi batch 2', pic: 'Siti' },
    { id: 't4', item_id: '2', type: 'in', quantity: 10, price: 65000, timestamp: '2026-02-26T07:30:00Z', supplier: 'Pasar Induk', notes: 'Harga cabai naik', pic: 'Dodi' },
    { id: 't5', item_id: '2', type: 'out', quantity: 4.5, timestamp: '2026-02-27T09:00:00Z', reason: 'Usage', notes: 'Bikin sambal geprek', pic: 'Siti' },
    { id: 't6', item_id: '1', type: 'out', quantity: 2, timestamp: '2026-02-26T18:00:00Z', reason: 'Waste', notes: 'Ayam berbau tidak sedap', pic: 'Agus' },
    { id: 't7', item_id: '3', type: 'in', quantity: 20, timestamp: new Date().toISOString(), supplier: 'Toko Makmur', notes: 'Restock mingguan', pic: 'Mae' },
];
