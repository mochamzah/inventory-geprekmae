import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ayam Geprek Inventory",
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
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar for Desktop */}
          <div className="hidden md:flex md:w-64 md:flex-col">
            <Sidebar />
          </div>

          {/* Main content area */}
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            <Header />
            <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
              <div className="py-6 px-4 sm:px-6 md:px-8 h-full">
                {children}
              </div>
            </main>
          </div>
        </div>

        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around">
          <Sidebar mobile />
        </div>
      </body>
    </html>
  );
}
