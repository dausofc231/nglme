// pages/auth.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import Image from 'next/image';
import { sendPasswordResetEmail, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AuthPage() {
  const router = useRouter();
  const { user, register, login, logout } = useAuth();

  // UI mode
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    newPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // check if URL contains reset code
  useEffect(() => {
    if (router.query.mode === 'resetPassword' && router.query.oobCode) {
      setMode('reset');
    }
  }, [router.query]);

  // redirect ke dashboard jika login
  useEffect(() => {
    if (user && mode === 'login') router.push('/dashboard');
  }, [user, mode, router]);

  // validasi input
  const validateForm = () => {
    const newErrors = {};

    if (mode === 'register') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username harus diisi';
      } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.username)) {
        newErrors.username = 'Username hanya boleh mengandung huruf, angka, _, dan .';
      }
    }

    if ((mode === 'login' || mode === 'register' || mode === 'forgot') && !formData.email) {
      newErrors.email = 'Email harus diisi';
    }

    if ((mode === 'login' || mode === 'register') && !formData.password) {
      newErrors.password = 'Password harus diisi';
    }

    if (mode === 'register' && formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (mode === 'reset' && !formData.newPassword) {
      newErrors.newPassword = 'Password baru harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        setNotification({ message: 'Login berhasil!', type: 'success' });
        router.push('/dashboard');
      } 
      else if (mode === 'register') {
        await register(formData.email, formData.password, formData.username);
        await logout();
        setNotification({ message: 'Registrasi berhasil! Silakan login.', type: 'success' });
        setMode('login');
        setFormData({ username: '', email: formData.email, password: '' });
      }
      else if (mode === 'forgot') {
        const actionCodeSettings = {
          url: `${window.location.origin}/auth`, // arahkan kembali ke web kamu
          handleCodeInApp: true,
        };
        await sendPasswordResetEmail(auth, formData.email, actionCodeSettings);
        setNotification({ message: 'Link reset password telah dikirim ke email kamu.', type: 'success' });
        setMode('login');
        setFormData({ email: '', password: '' });
      }
      else if (mode === 'reset') {
        const { oobCode } = router.query;
        await confirmPasswordReset(auth, oobCode, formData.newPassword);
        setNotification({ message: 'Password berhasil direset! Silakan login kembali.', type: 'success' });
        router.replace('/auth'); // hapus query agar balik ke login UI
        setMode('login');
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: error.message, type: 'error' });
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
              src="/datakuy/logo.png"
              alt="Logo Datakuy"
              width={80}
              height={80}
              className="mx-auto rounded-full shadow-sm"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {mode === 'login'
              ? 'Selamat Datang Kembali'
              : mode === 'register'
              ? 'Buat Akun Baru'
              : mode === 'forgot'
              ? 'Lupa Password'
              : 'Atur Ulang Password'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* REGISTER */}
          {mode === 'register' && (
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

          {/* EMAIL */}
          {(mode !== 'reset') && (
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
          )}

          {/* PASSWORD */}
          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
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
          )}

          {/* RESET PASSWORD */}
          {mode === 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan password baru"
              />
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? 'Memproses...'
              : mode === 'login'
              ? 'Login'
              : mode === 'register'
              ? 'Register'
              : mode === 'forgot'
              ? 'Kirim Link Reset'
              : 'Reset Password'}
          </button>
        </form>

        {/* FOOTER LINKS */}
        <div className="mt-6 text-center">
          {mode === 'login' && (
            <p className="text-gray-600">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrors({}); }}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Daftar Sekarang
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrors({}); }}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Login di sini
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p className="text-gray-600">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Kembali ke login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
