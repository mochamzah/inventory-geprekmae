# Supabase Setup Guide - Geprek Mae Inventory

Ikuti langkah-langkah di bawah ini untuk menghubungkan aplikasi ini ke database Supabase Anda.

## 1. Buat Proyek Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard).
2. Buat proyek baru (misal: `geprek-mae-inventory`).
3. Tunggu hingga database siap.

## 2. Jalankan SQL Schema
Di dashboard Supabase, buka menu **SQL Editor**, lalu klik **New Query**. Copy-paste kode SQL berikut dan klik **Run**:

```sql
-- Tabel Master Barang
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  min_stock NUMERIC DEFAULT 0,
  current_stock NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel Transaksi
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('in', 'out')),
  quantity NUMERIC NOT NULL,
  price NUMERIC, -- Total harga untuk inbound
  supplier TEXT,
  reason TEXT, -- 'Usage' atau 'Waste' untuk outbound
  notes TEXT,
  pic TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Trigger untuk update stok otomatis saat transaksi masuk
CREATE OR REPLACE FUNCTION update_stock_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.type = 'in') THEN
    UPDATE items SET current_stock = current_stock + NEW.quantity WHERE id = NEW.item_id;
  ELSIF (NEW.type = 'out') THEN
    UPDATE items SET current_stock = current_stock - NEW.quantity WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_inserted
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_stock_after_transaction();

-- Masukkan data awal (Mock Data)
INSERT INTO items (name, category, unit, min_stock, current_stock) VALUES
('Ayam Broiler', 'Daging', 'Ekor', 10, 5),
('Cabai Domba', 'Sayuran', 'Kg', 2, 5.5),
('Minyak Goreng', 'Sembako', 'Liter', 10, 45),
('Box Takeaway', 'Packaging', 'Pcs', 100, 85);

-- 4. Kebijakan Keamanan (RLS - Row Level Security)
-- Jalankan ini agar aplikasi bisa menambah/mengedit data dari browser.
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for anon" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON transactions FOR ALL USING (true) WITH CHECK (true);
```

## 3. Konfigurasi Environment Variables
Buat file baru bernama `.env.local` di folder utama (root) aplikasi ini, lalu isi dengan data dari menu **Project Settings > API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Jalankan Aplikasi
Setelah setting di atas selesai, jalankan `npm run dev` dan aplikasi akan otomatis membaca data dari database Supabase Anda.
