// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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

  // ✅ Register dengan cek duplikat username/email
  const register = async (email, password, username) => {
    // cek username/email sudah ada
    const q1 = query(collection(db, 'users'), where('email', '==', email));
    const q2 = query(collection(db, 'users'), where('username', '==', username));
    const [emailDocs, userDocs] = await Promise.all([getDocs(q1), getDocs(q2)]);
    if (!emailDocs.empty) throw new Error('auth/email-already-in-use');
    if (!userDocs.empty) throw new Error('auth/username-already-in-use');

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await getIdToken(user, true);

    await setDoc(doc(db, 'users', user.uid), {
      username,
      email,
      role: 'users',
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