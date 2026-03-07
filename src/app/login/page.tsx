"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/SupabaseAuthProvider';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
  };

  // Registration is disabled in UI. Create users via Supabase dashboard (admin) only.

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
        <h2 className="text-lg font-bold mb-4">Masuk ke Sistem</h2>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full mt-1 px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full mt-1 px-3 py-2 border rounded-lg" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-2">
            <button disabled={loading} className="flex-1 py-2 bg-green-600 text-white rounded-lg">{loading ? 'Memproses...' : 'Masuk'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
