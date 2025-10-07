// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // ✅ flag agar tidak trigger ulang

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // ✅ Jika sedang logout manual, jangan ubah state user
      if (isLoggingOut) return;

      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isLoggingOut]);

  // ✅ Register user baru
  const register = async (email, password, username) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Pastikan token auth valid sebelum menulis ke Firestore
    await getIdToken(user, true);

    await setDoc(doc(db, 'users', user.uid), {
      username,
      email,
      role: 'users',
      status: true, // ✅ akun aktif secara default
      createdAt: new Date().toISOString()
    });

    return user;
  };

  // ✅ Login user
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // ✅ Logout tanpa efek lompat UI
  const logout = async () => {
    setIsLoggingOut(true);
    setUser(null);
    await signOut(auth);
    // beri delay pendek biar flag reset setelah logout selesai
    setTimeout(() => setIsLoggingOut(false), 400);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}