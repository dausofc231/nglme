// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);

        // 🔁 Dengarkan perubahan realtime pada data user
        const unsubscribeUser = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const mergedUser = { uid: firebaseUser.uid, email: firebaseUser.email, ...data };
            setUser(mergedUser);

            // ⚙️ Jika status = false → auto logout
            if (data.status === false) {
              await signOut(auth);
              setUser(null);
              router.push('/auth');
              return;
            }

            // ⚙️ Pindahkan otomatis ke halaman sesuai role
            const currentPath = router.pathname;
            if (data.role === 'owners' && !currentPath.startsWith('/dasborowners')) {
              router.push('/dasborowners');
            } else if (data.role === 'users' && !currentPath.startsWith('/dashboard')) {
              router.push('/dashboard');
            }

          } else {
            // Jika data user dihapus → logout total
            await signOut(auth);
            setUser(null);
            router.push('/auth');
          }
        });

        return () => unsubscribeUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const register = async (email, password, username) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await getIdToken(user, true);

    await setDoc(doc(db, 'users', user.uid), {
      username,
      email,
      role: 'users',
      status: true,
      createdAt: new Date().toISOString(),
    });

    return user;
  };

  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    setUser(null);
    await signOut(auth);
    router.push('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
