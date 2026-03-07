"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './SupabaseAuthProvider';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // allow public routes like /login
    const publicPaths = ['/login'];
    if (loading) return;
    if (!user && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  // While auth state is resolving, don't render children to avoid flash
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Memeriksa autentikasi...</div>
      </div>
    );
  }

  return <>{children}</>;
}
