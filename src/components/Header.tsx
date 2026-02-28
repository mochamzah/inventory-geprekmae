"use client";

import { Bell, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();

    const getPageTitle = () => {
        switch (pathname) {
            case "/":
                return "Dashboard";
            case "/items":
                return "Master Items";
            case "/inbound":
                return "Inbound (Stock Masuk)";
            case "/outbound":
                return "Outbound (Stock Keluar)";
            case "/history/inbound":
                return "Riwayat Masuk";
            case "/history/outbound":
                return "Riwayat Keluar";
            default:
                return "Dashboard";
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 hidden md:block">
            <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
                <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
                <div className="flex items-center space-x-4">
                    <button className="p-2 text-gray-400 hover:text-gray-500 relative transition-colors">
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    </button>

                    <div className="flex items-center">
                        <button className="flex bg-white text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                            <span className="sr-only">Open user menu</span>
                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <User className="h-5 w-5" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
