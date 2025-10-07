// pages/auth.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { sendPasswordResetEmail, confirmPasswordReset } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AuthPage() {
  const router = useRouter();
  const { user, register, login, logout } = useAuth();

  const [mode, setMode] = useState('login'); // login | register | forgot | reset
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    newPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Detect reset password mode
  useEffect(() => {
    if (router.query.mode === 'resetPassword' && router.query.oobCode) {
      setMode('reset');
    } else if (router.query.mode === 'register') {
      setMode('register');
    }
  }, [router.query]);

  // ✅ Redirect ke dashboard jika sudah login
  useEffect(() => {
    if (user && mode === 'login') {
      if (user.role === 'owners') {
        router.push('/dasborowners');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, mode, router]);

  // ✅ Mapping custom error Firebase
  const firebaseErrorMap = {
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/user-disabled': 'Akun kamu telah dinonaktifkan.',
    'auth/user-not-found': 'Email tidak terdaftar.',
    'auth/missing-password': 'Password wajib diisi.',
    'auth/wrong-password': 'Password salah, coba lagi.',
    'auth/invalid-credential': 'Email atau password salah.',
    'auth/email-already-in-use': 'Email sudah terdaftar.',
    'auth/weak-password': 'Password terlalu lemah (minimal 6 karakter).',
  };

  const getErrorMessage = (error) => {
    const code = error?.code;
    return firebaseErrorMap[code] || 'Terjadi kesalahan, coba lagi nanti.';
  };

  // ✅ Validasi form input
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

  // ✅ Ambil role user dari Firestore
  async function getUserRole(uid) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().role : 'users';
  }

  // ✅ Submit handler
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    if (mode === 'login') {
      // 🔹 Cek dulu data user berdasarkan email
      const q = query(collection(db, 'users'), where('email', '==', formData.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setNotification({ message: 'Email tidak terdaftar.', type: 'error' });
        setFormData({ email: '', password: '' });
        setIsLoading(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();

      // 🔹 Jika akun dinonaktifkan, langsung hentikan proses login
      if (userData.status === false) {
        setNotification({
          message: 'Akun kamu telah dinonaktifkan oleh admin.',
          type: 'error'
        });
        setFormData({ email: '', password: '' });
        setIsLoading(false);
        return;
      }

      // 🔹 Jika aktif, baru lanjut login
      const userCred = await login(formData.email, formData.password);
      const role = await getUserRole(userCred.user.uid);

      setNotification({ message: 'Login berhasil!', type: 'success' });

      if (role === 'owners') {
        router.push('/dasborowners');
      } else {
        router.push('/dashboard');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    setNotification({ message: 'Email atau password salah.', type: 'error' });
  } finally {
    setIsLoading(false);
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
          url: `${window.location.origin}/auth`,
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
        router.replace('/auth');
        setMode('login');
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: getErrorMessage(error), type: 'error' });
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
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <Image
              src="/media/logo.png"
              alt="Logo"
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
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan username"
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            </div>
          )}

          {(mode !== 'reset') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {mode === 'reset' ? 'Password Baru' : 'Password'}
                </label>
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

              <div className="relative">
                <input
                  type={
                    mode === 'reset'
                      ? showNewPassword ? 'text' : 'password'
                      : showPassword ? 'text' : 'password'
                  }
                  value={mode === 'reset' ? formData.newPassword : formData.password}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      [mode === 'reset' ? 'newPassword' : 'password']: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.password || errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={mode === 'reset' ? 'Masukkan password baru' : 'Masukkan password'}
                />
                <button
                  type="button"
                  onClick={() =>
                    mode === 'reset'
                      ? setShowNewPassword((p) => !p)
                      : setShowPassword((p) => !p)
                  }
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {mode === 'reset'
                    ? showNewPassword
                      ? <EyeOff size={20} />
                      : <Eye size={20} />
                    : showPassword
                      ? <EyeOff size={20} />
                      : <Eye size={20} />}
                </button>
              </div>

              {(errors.password || errors.newPassword) && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password || errors.newPassword}
                </p>
              )}
            </div>
          )}

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
