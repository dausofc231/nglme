import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  try {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ role: null });

    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return res.status(404).json({ role: null });

    res.status(200).json({ role: snap.data().role });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ role: null });
  }
}
