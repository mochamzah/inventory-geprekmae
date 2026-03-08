"use client";

import Link from 'next/link';
import { Bell, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '@/components/SupabaseAuthProvider';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();

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
            case "/history":
                return "Riwayat";
            default:
                return "Dashboard";
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold tracking-tight text-red-600">GEPREK MAE</span>
                    <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>
                    <h1 className="text-xl font-semibold text-gray-900 hidden md:block">{getPageTitle()}</h1>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <div className="text-xs font-medium text-gray-900 truncate max-w-[180px]">{user.email}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Administrator</div>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shrink-0">
                                <User className="h-5 w-5" />
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                            >
                                Keluar
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
                            <User className="h-4 w-4" />
                            Masuk
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
