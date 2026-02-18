'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { createSessionCookie } from '@/lib/firebase/auth';
import type { User } from '@/lib/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  needsProfile: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  loading: true,
  needsProfile: false,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  async function fetchUserProfile(fbUser: FirebaseUser) {
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setUser({
        uid: fbUser.uid,
        username: data.username,
        name: data.name,
        avatar: data.avatar,
        bio: data.bio || '',
        categories: data.categories || [],
        stats: data.stats || { prompts: 0, likes: 0, saved: 0 },
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      });
      setNeedsProfile(false);
    } else {
      setUser(null);
      setNeedsProfile(true);
    }
  }

  async function refreshUser() {
    if (firebaseUser) {
      await fetchUserProfile(firebaseUser);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Create server session cookie
        try {
          const idToken = await fbUser.getIdToken();
          await createSessionCookie(idToken);
        } catch {
          // Session creation may fail on first load if already exists
        }
        await fetchUserProfile(fbUser);
      } else {
        setUser(null);
        setNeedsProfile(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, needsProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
