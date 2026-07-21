'use client';

/**
 * Signs the visitor in anonymously on first load, giving them a stable
 * Firebase uid (and therefore a stable Tasbeeh history) without forcing
 * an account/sign-up flow. This mirrors what the original plan's mobile
 * app would have done for a low-friction dhikr counter. Upgrading an
 * anonymous user to a real account later (email, Google, etc.) is a
 * standard Firebase Auth flow (`linkWithCredential`) that preserves the
 * same uid — worth doing before Tasbeeh history matters enough that
 * losing local browser storage would be painful.
 */
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setState({ user, loading: false, error: null });
        return;
      }
      try {
        await signInAnonymously(auth);
        // onAuthStateChanged will fire again with the new user
      } catch (err) {
        setState({
          user: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Sign-in failed',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return state;
}

export async function getIdToken(): Promise<string | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}
