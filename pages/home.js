// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function HomeRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  // 🔹 Fungsi ambil role user dari Firestore
  const getUserRole = async (uid) => {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().role : 'users';
  };

  useEffect(() => {
    const redirectUser = async () => {
      if (!user) {
        // selalu ke halaman home kalau belum login
        router.push('/home');
        return;
      }

      // kalau sudah login, cek role-nya
      const role = await getUserRole(user.uid);
      if (role === 'owners') {
        router.push('/dasborowners');
      } else {
        router.push('/dashboard');
      }
    };

    redirectUser();
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
