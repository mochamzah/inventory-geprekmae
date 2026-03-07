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
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-gray-700">{user.email}</div>
                                <button onClick={handleSignOut} className="px-3 py-1 text-sm bg-gray-100 rounded-md">Keluar</button>
                            </div>
                        ) : (
                            <Link href="/login" className="flex bg-white text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                                <span className="sr-only">Open user menu</span>
                                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <User className="h-5 w-5" />
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
