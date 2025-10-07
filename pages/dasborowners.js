import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';

export default function DasborOwners() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // modal utama
  const [menuOpenId, setMenuOpenId] = useState(null); // dropdown 3 titik
  const [editingUser, setEditingUser] = useState(null); // user yg sedang diubah role-nya

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
    // hanya tampilkan owners dan users
    setUsers(userList.filter((u) => u.role === 'owners' || u.role === 'users'));
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const toggleStatus = async (id, currentStatus) => {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, { status: !currentStatus });
    fetchUsers();
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, { role: newRole });
      alert(`Role pengguna berhasil diubah menjadi "${newRole}"`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Gagal mengubah role:', err);
      alert('Terjadi kesalahan saat mengubah role.');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
          <h1 className="text-xl font-semibold">Owner Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Halo, {user.username || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tombol buka daftar pengguna */}
      <main className="max-w-6xl mx-auto py-10 text-center">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow"
        >
          Lihat Daftar Pengguna
        </button>
      </main>

      {/* Modal daftar pengguna */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white w-[90%] md:w-[70%] rounded-xl shadow-lg p-6 relative">
            <h2 className="text-2xl font-bold mb-4">Daftar Akun</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 border-b">Name</th>
                    <th className="px-6 py-3 border-b">Email</th>
                    <th className="px-6 py-3 border-b">Role</th>
                    <th className="px-6 py-3 border-b">Status</th>
                    <th className="px-6 py-3 border-b text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 border-b">{u.username || '-'}</td>
                      <td className="px-6 py-3 border-b">{u.email}</td>
                      <td className="px-6 py-3 border-b capitalize">{u.role}</td>
                      <td className="px-6 py-3 border-b">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            u.status
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {u.status ? 'true' : 'false'}
                        </span>
                      </td>
                      <td className="px-6 py-3 border-b text-right relative">
                        <button
                          onClick={() =>
                            setMenuOpenId(menuOpenId === u.id ? null : u.id)
                          }
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          &#x2022;&#x2022;&#x2022;
                        </button>

                        {menuOpenId === u.id && (
                          <div className="absolute right-6 top-10 bg-white border rounded-lg shadow-lg w-28 z-10">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setMenuOpenId(null);
                              }}
                              className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                toggleStatus(u.id, u.status);
                                setMenuOpenId(null);
                              }}
                              className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                              {u.status ? 'false' : 'true'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Role */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-3">Edit Role</h3>
            <p className="text-sm mb-4">
              Ubah role untuk <b>{editingUser.email}</b>
            </p>

            <select
              className="border rounded-lg w-full px-3 py-2 mb-4"
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value })
              }
            >
              <option value="users">users</option>
              <option value="owners">owners</option>
            </select>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Batal
              </button>
              <button
                onClick={() =>
                  handleRoleChange(editingUser.id, editingUser.role)
                }
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}