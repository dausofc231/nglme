// pages/_app.js
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}