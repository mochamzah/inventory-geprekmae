"use client";

import { useState, useEffect, useRef } from "react";

interface Item {
    id: string;
    name: string;
    category?: string;
    unit?: string;
    current_stock?: number;
}

interface Props {
    items: Item[];
    selectedId?: string;
    onSelect: (id: string, label: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function ItemSearchSelect({ items, selectedId, onSelect, placeholder, disabled }: Props) {
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // if selectedId provided, set inputValue to matching label
        if (selectedId) {
            const it = items.find(i => i.id === selectedId);
            if (it) setInputValue(labelFor(it));
        }
    }, [selectedId, items]);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    const labelFor = (i: Item) => `${i.name}${i.current_stock !== undefined && i.unit ? ` (${i.current_stock} ${i.unit})` : i.category ? ` (${i.category})` : ''}`;

    const filtered = inputValue.trim() === ''
        ? items.slice(0, 10)
        : items.filter(i => {
            const q = inputValue.toLowerCase();
            return i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q) || (i.unit || '').toLowerCase().includes(q);
        }).slice(0, 10);

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) setIsOpen(true);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight(h => Math.min(h + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight(h => Math.max(h - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const sel = filtered[highlight];
            if (sel) selectItem(sel);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    }

    function selectItem(i: Item) {
        const label = labelFor(i);
        setInputValue(label);
        setIsOpen(false);
        onSelect(i.id, label);
    }

    return (
        <div className="relative" ref={containerRef}>
            <input
                type="text"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls="item-search-list"
                disabled={disabled}
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); setHighlight(0); onSelect('', e.target.value); }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-red-500 sm:text-sm"
            />

            {isOpen && filtered.length > 0 && (
                <ul id="item-search-list" role="listbox" className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto">
                    {filtered.map((it, idx) => (
                        <li
                            key={it.id}
                            role="option"
                            aria-selected={highlight === idx}
                            onMouseDown={(e) => { e.preventDefault(); selectItem(it); }}
                            onMouseEnter={() => setHighlight(idx)}
                            className={`px-3 py-2 cursor-pointer text-sm ${highlight === idx ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                            <div className="font-medium text-gray-900">{it.name}</div>
                            <div className="text-xs text-gray-500">{it.category || ''}{it.current_stock !== undefined ? ` — Stok: ${it.current_stock} ${it.unit || ''}` : ''}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
