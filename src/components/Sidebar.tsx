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
        { name: "🏠 Dashboard", href: "/", icon: LayoutDashboard },
        { name: "📦 Master Barang", href: "/items", icon: Package },
        { name: "📥 Barang Masuk", href: "/inbound", icon: ArrowDownToLine },
        { name: "📤 Barang Keluar", href: "/outbound", icon: ArrowUpFromLine },
        { name: "📜 Riwayat Masuk", href: "/history/inbound", icon: History },
        { name: "📜 Riwayat Keluar", href: "/history/outbound", icon: History },
    ];

    if (mobile) {
        return (
            <nav className="flex w-full justify-around items-center h-16 bg-white border-t border-gray-200">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${isActive ? "text-red-600" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            <item.icon className={`h-5 w-5 mb-1 ${isActive ? "text-red-600" : "text-gray-400"}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        );
    }

    return (
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
            <div className="flex flex-col flex-shrink-0 px-6 py-6 border-b border-gray-100">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800 tracking-tight">
                    Geprek Mae: Inventory System
                </span>
                <span className="text-xs font-medium text-gray-500 mt-1">Cimahi Central Kitchen</span>
            </div>
            <div className="flex-grow flex flex-col mt-6">
                <nav className="flex-1 px-4 space-y-2 bg-white" aria-label="Sidebar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? "bg-red-50 text-red-700"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon
                                    className={`flex-shrink-0 mr-3 h-5 w-5 ${isActive ? "text-red-600" : "text-gray-400 group-hover:text-gray-500"
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
