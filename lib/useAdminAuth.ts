'use client';

/**
 * Separate from useAuth.ts (which signs visitors in anonymously for
 * Tasbeeh). Admin access needs a real account plus the 'admin' custom
 * claim, set server-side via:
 *
 *   firebase_admin.auth.set_custom_user_claims(uid, {"admin": True})
 *
 * (run that once, from a trusted script — never expose an endpoint that
 * lets a client grant itself the claim). After granting it, the user
 * must sign out/in (or force-refresh their ID token) to pick it up,
 * which is why this hook calls getIdTokenResult(user, true) — the
 * `true` forces a refresh instead of using a cached token that might
 * predate the claim being set.
 */
import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, isAdmin: false, loading: false, error: null });
        return;
      }
      const tokenResult = await user.getIdTokenResult(true);
      setState({
        user,
        isAdmin: Boolean(tokenResult.claims.admin),
        loading: false,
        error: null,
      });
    });
    return () => unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      // onAuthStateChanged fires and updates state
    } catch (err) {
      setState({
        user: null,
        isAdmin: false,
        loading: false,
        error: err instanceof Error ? err.message : 'Sign-in failed',
      });
    }
  }

  async function signOutAdmin() {
    await signOut(getFirebaseAuth());
  }

  return { ...state, signIn, signOutAdmin };
}

export async function getAdminIdToken(): Promise<string | null> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}
