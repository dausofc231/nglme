import { useRouter } from 'next/router';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="mb-6">
          <Image
            src="/media/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="mx-auto rounded-full"
            priority
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Selamat Datang di <span className="text-indigo-600">SamsulShop</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Daftar sekarang untuk mulai menggunakan layanan kami.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/auth?mode=register')}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition"
          >
            Register
          </button>
          <button
            onClick={() => router.push('/auth?mode=login')}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
              }
