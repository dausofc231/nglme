import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';

export default function DasborOwners() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user) return router.push('/auth');
    if (user.role !== 'owners') return router.push('/dashboard');
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const userList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(userList);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <h1 className="text-xl font-semibold">Owner Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Halo, {user.username || user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-6">
        <h2 className="text-2xl font-bold mb-4">Daftar Pengguna</h2>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-left border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 border-b">Username</th>
                <th className="px-6 py-3 border-b">Email</th>
                <th className="px-6 py-3 border-b">Role</th>
                <th className="px-6 py-3 border-b">Tanggal Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-100">
                  <td className="px-6 py-3 border-b">{u.username || '-'}</td>
                  <td className="px-6 py-3 border-b">{u.email}</td>
                  <td className="px-6 py-3 border-b">{u.role}</td>
                  <td className="px-6 py-3 border-b">
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}