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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUser({ uid: user.uid, email: user.email, ...userDoc.data() });
      } else setUser(null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const register = async (email, password, username) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Pastikan token auth valid sebelum menulis ke Firestore
    await getIdToken(user, true);

    await setDoc(doc(db, 'users', user.uid), {
      username,
      email,
      role: 'users',
      status: true,
      createdAt: new Date().toISOString()
    });

    return user;
  };

  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

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
      
