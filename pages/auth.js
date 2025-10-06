// pages/auth.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import Image from 'next/image';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, register, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && isLogin) {
      router.push('/dashboard');
    }
  }, [user, isLogin, router]);

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username harus diisi';
      } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.username)) {
        newErrors.username = 'Username hanya boleh mengandung huruf, angka, _, dan .';
      }
    }

    if (!formData.email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        setNotification({ message: 'Login berhasil!', type: 'success' });
        router.push('/dashboard');
      } else {
        await register(formData.email, formData.password, formData.username);
        setNotification({ message: 'Registrasi berhasil! Silakan login.', type: 'success' });
        setIsLogin(true);
        setFormData({ username: '', email: formData.email, password: '' });
      }
    } catch (error) {
      console.error(error);
      let errorMessage = 'Terjadi kesalahan';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email sudah terdaftar';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Email tidak terdaftar';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Password salah';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid';
          break;
        default:
          errorMessage = error.message;
      }
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <Image
              src="../media/logo_023321.png"
              alt="samsulShop"
              width={80}
              height={80}
              className="mx-auto rounded-full shadow-sm"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan username"
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              {isLogin && (
                <button type="button" className="text-sm text-indigo-600 hover:text-indigo-500">
                  Lupa password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {isLogin ? 'Daftar Sekarang' : 'Login di sini'}
            </button>
          </p>
          {!isLogin && (
            <p className="text-xs text-gray-500 mt-2">
              Dengan mendaftar, Anda menyetujui syarat dan ketentuan kami
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
