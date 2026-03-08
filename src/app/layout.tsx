import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalSidebar from "@/components/ConditionalSidebar";
import Header from "@/components/Header";
import { SupabaseAuthProvider } from '@/components/SupabaseAuthProvider';
import AuthGuard from '@/components/AuthGuard';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Geprek Mae Inventory",
  description: "Sistem Manajemen Stok Ayam Geprek",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <SupabaseAuthProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar for Desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col">
              <ConditionalSidebar />
            </div>

            {/* Main content area */}
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
              <Header />
              <main className="flex-1 relative overflow-y-auto focus:outline-none pb-24 md:pb-0">
                <div className="py-6 px-4 sm:px-6 md:px-8">
                  {/* Auth guard prevents unauthenticated access to protected pages */}
                  <AuthGuard>{children}</AuthGuard>
                </div>
              </main>
            </div>
          </div>

          <div className="md:hidden fixed bottom-0 w-full z-20">
            <ConditionalSidebar mobile />
          </div>
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
