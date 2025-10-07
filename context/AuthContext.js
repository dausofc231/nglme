// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();
export function useAuth() { 
  return useContext(AuthContext); 
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Pantau status login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() });
        } else {
          // jika tidak ada dokumen user, logout otomatis
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🆕 Register dengan validasi duplikat username & email
  const register = async (email, password, username) => {
    // cek duplikat email
    const emailQuery = query(collection(db, 'users'), where('email', '==', email));
    const usernameQuery = query(collection(db, 'users'), where('username', '==', username));

    const [emailSnap, usernameSnap] = await Promise.all([
      getDocs(emailQuery),
      getDocs(usernameQuery)
    ]);

    if (!emailSnap.empty) {
      const error = new Error('Email sudah terdaftar.');
      error.code = 'auth/email-already-in-use';
      throw error;
    }

    if (!usernameSnap.empty) {
      const error = new Error('Username sudah digunakan.');
      error.code = 'auth/username-already-in-use';
      throw error;
    }

    // Buat akun baru
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Pastikan token auth valid sebelum tulis ke Firestore
    await getIdToken(newUser, true);

    // Simpan data user baru
    await setDoc(doc(db, 'users', newUser.uid), {
      username,
      email,
      role: 'users', // default
      createdAt: new Date().toISOString()
    });

    return newUser;
  };

  // 🔐 Login
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // 🚪 Logout
  const logout = async () => {
    setUser(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
                       }
