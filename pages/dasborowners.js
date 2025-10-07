// pages/dasborowners.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import toast, { Toaster } from 'react-hot-toast';
import { EllipsisHorizontalIcon } from 'lucide-react';

export default function DasborOwners() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);

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

  const toggleDropdown = (userId) => {
    setDropdownOpen(dropdownOpen === userId ? null : userId);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    await updateDoc(doc(db, 'users', userId), { status: !currentStatus });
    toast.success(`Status akun diubah menjadi ${!currentStatus}`);
    fetchUsers();
  };

  const handleEditRole = async (userId, currentRole) => {
    const newRole = currentRole === 'owners' ? 'users' : 'owners';
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    toast.success(`Role akun berhasil diubah menjadi ${newRole}`);
    fetchUsers();
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" reverseOrder={false} />
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <h1 className="text-xl font-semibold">Owner Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Halo, {user.username || user.email}</span>
            <button
              onClick={logout}
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
                <th className="px-6 py-3 border-b">Status</th>
                <th className="px-6 py-3 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-100">
                  <td className="px-6 py-3 border-b">{u.username || '-'}</td>
                  <td className="px-6 py-3 border-b">{u.email}</td>
                  <td className="px-6 py-3 border-b">{u.role}</td>
                  <td className="px-6 py-3 border-b">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        u.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.status ? 'true' : 'false'}
                    </span>
                  </td>
                  <td className="px-6 py-3 border-b text-center relative">
                    <button
                      onClick={() => toggleDropdown(u.id)}
                      className="p-2 rounded hover:bg-gray-200"
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>

                    {dropdownOpen === u.id && (
                      <div className="absolute right-6 mt-2 w-28 bg-white border rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => handleEditRole(u.id, u.role)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Edit Role
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          {u.status ? 'Set False' : 'Set True'}
                        </button>
                      </div>
                    )}
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
