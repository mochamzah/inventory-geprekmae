"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";

interface SidebarProps {
    mobile?: boolean;
}

export default function Sidebar({ mobile }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Master Barang", href: "/items", icon: Package },
        { name: "Barang Masuk", href: "/inbound", icon: ArrowDownToLine },
        { name: "Barang Keluar", href: "/outbound", icon: ArrowUpFromLine },
        { name: "Riwayat", href: "/history", icon: History },
    ];

    if (mobile) {
        return (
            <nav className="flex w-full justify-around items-center h-16 bg-slate-900 border-t border-slate-800">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={item.name}
                            aria-label={item.name}
                            className={`flex items-center justify-center w-full h-full transition-colors ${isActive ? "text-red-500" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <item.icon className={`h-6 w-6 ${isActive ? "text-red-500" : "text-slate-500 group-hover:text-slate-300"}`} aria-hidden="true" />
                            <span className="sr-only">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-900 overflow-y-auto w-64 border-r border-slate-800">
            <div className="flex flex-col flex-shrink-0 px-6 py-8 border-b border-slate-800">
                <div className="flex items-center justify-center mb-1">
                    <span className="text-2xl font-black text-white tracking-tighter italic uppercase text-center">
                        GEPREK <span className="text-red-500">MAE</span>
                    </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center">
                    Inventory System
                </span>
            </div>
            <div className="flex-grow flex flex-col mt-6">
                <nav className="flex-1 px-4 space-y-1" aria-label="Sidebar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <item.icon
                                    className={`flex-shrink-0 mr-3 h-5 w-5 transition-colors duration-200 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
