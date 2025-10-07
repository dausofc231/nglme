import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function DasborOwners() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // 🔐 Akses kontrol
  useEffect(() => {
    if (!user) router.push('/auth');
    else if (user.role !== 'owners') router.push('/dashboard');
  }, [user, router]);

  // 🔄 Ambil semua user
  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  // ✏️ Ubah role user
  const changeRole = async (uid, newRole) => {
    if (uid === user.uid) return alert("Tidak bisa ubah role diri sendiri!");
    setUpdating(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      alert(`Role berhasil diubah ke "${newRole}"`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Gagal mengubah role');
    } finally {
      setUpdating(null);
    }
  };

  // 🗑️ Hapus user
  const deleteUser = async (uid, username, role) => {
    if (uid === user.uid) return alert("Tidak bisa hapus diri sendiri!");
    if (role === 'owners') return alert("Tidak bisa hapus owner lain!");
    if (!confirm(`Yakin ingin hapus akun ${username}?`)) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      alert("User berhasil dihapus!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus user!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-xl">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-gray-700 transition">
                <td className="px-6 py-4">{u.username}</td>
                <td className="px-6 py-4 text-gray-300">{u.email}</td>
                <td className="px-6 py-4 text-gray-400">{u.role}</td>
                <td className="px-6 py-4 space-x-2">
                  {u.role !== 'owners' && (
                    <select
                      disabled={updating === u.id}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      value={u.role}
                      className="bg-gray-700 text-white px-3 py-2 rounded-md"
                    >
                      <option value="users">users</option>
                      <option value="admins">admins</option>
                      <option value="owners">owners</option>
                    </select>
                  )}
                  {u.role !== 'owners' && (
                    <button
                      onClick={() => deleteUser(u.id, u.username, u.role)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md"
                    >
                      Hapus
                    </button>
                  )}
                  {u.role === 'owners' && (
                    <span className="text-gray-500 text-sm">Owner (tidak bisa diubah)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}