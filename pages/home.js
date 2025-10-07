// pages/home.js
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  const goToRegister = () => {
    router.push('/auth?mode=register'); // langsung ke form register
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200 p-6">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Selamat Datang di <span className="text-indigo-600">SamsulShop</span> 🛍️
        </h1>
        <p className="text-gray-600 mb-8">
          Yuk gabung sekarang dan nikmati pengalaman belanja terbaikmu!
        </p>

        <button
          onClick={goToRegister}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition"
        >
          Daftar Sekarang
        </button>
      </div>
    </div>
  );
}