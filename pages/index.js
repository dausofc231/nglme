import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function IndexRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika user sudah login, langsung arahkan sesuai role
    if (user) {
      if (user.role === 'owners') {
        router.replace('/dasborowners');
      } else {
        router.replace('/dashboard');
      }
    } 
    // Jika belum login, arahkan ke halaman /home
    else {
      router.replace('/home');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {user ? 'Memuat dashboard...' : 'Mengalihkan ke halaman utama...'}
        </p>
      </div>
    </div>
  );
    }
