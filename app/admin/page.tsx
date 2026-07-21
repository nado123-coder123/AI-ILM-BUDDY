'use client';

// Skip static prerendering — depends on Firebase Auth client-side.
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import {
  ApiError,
  getAyahRecord,
  getChatLogs,
  getHadithRecord,
  updateAyahRecord,
  updateHadithRecord,
} from '@/lib/api';
import { getAdminIdToken, useAdminAuth } from '@/lib/useAdminAuth';
import { ChatLogEntry } from '@/lib/types';

function SignInForm({ onSignIn, error, loading }: {
  onSignIn: (email: string, password: string) => void;
  error: string | null;
  loading: boolean;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-4 text-lg font-bold text-teal">Admin Sign In</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSignIn(email, password);
        }}
        className="space-y-3"
      >
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-teal px-4 py-2 text-sm font-semibold text-surface disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {error && <p className="text-sm text-error">{error}</p>}
      </form>
    </div>
  );
}

function ContentModeration() {
  const [docType, setDocType] = useState<'quran' | 'hadith'>('quran');
  const [docId, setDocId] = useState('');
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [rawJson, setRawJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const token = await getAdminIdToken();
      if (!token) throw new Error('Not signed in.');
      const data =
        docType === 'quran'
          ? await getAyahRecord(docId, token)
          : await getHadithRecord(docId, token);
      setRecord(data);
      setRawJson(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load record.');
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const token = await getAdminIdToken();
      if (!token) throw new Error('Not signed in.');
      const parsed = JSON.parse(rawJson);
      if (docType === 'quran') {
        await updateAyahRecord(docId, parsed, token);
      } else {
        await updateHadithRecord(docId, parsed, token);
      }
      setMessage('Saved.');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof SyntaxError
          ? 'Invalid JSON — fix the syntax before saving.'
          : 'Could not save record.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-3 text-lg font-bold text-teal">Content Moderation</h2>
      <p className="mb-4 text-xs text-inkMuted">
        Look up a Quran ayah or Hadith record by its Firestore document ID
        (e.g. <code>2_255</code> for Surah 2, Ayah 255) and edit it directly.
        Changes take effect immediately — there is no undo.
      </p>

      <div className="mb-3 flex gap-2">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value as 'quran' | 'hadith')}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="quran">Quran ayah</option>
          <option value="hadith">Hadith</option>
        </select>
        <input
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          placeholder="Document ID"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={load}
          disabled={!docId || loading}
          className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-surface disabled:opacity-60"
        >
          Load
        </button>
      </div>

      {record && (
        <div>
          <textarea
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs"
          />
          <button
            onClick={save}
            disabled={loading}
            className="mt-3 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}

      {message && <p className="mt-2 text-sm text-success">{message}</p>}
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}

function ChatLogReview() {
  const [logs, setLogs] = useState<ChatLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = await getAdminIdToken();
      if (!token) throw new Error('Not signed in.');
      setLogs(await getChatLogs(token, 50));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load chat logs.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-teal">Recent Chat Logs</h2>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-full bg-teal px-4 py-1.5 text-xs font-semibold text-surface disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>
      <p className="mb-4 text-xs text-inkMuted">
        Spot-check recent chatbot answers for quality or hallucination issues.
      </p>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="space-y-3">
        {logs.map((log, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-surfaceMuted p-3">
            <p className="text-sm font-semibold text-ink">{log.question}</p>
            <p className="mt-1 text-sm text-inkMuted">{log.answer}</p>
            <p className="mt-2 text-xs text-inkMuted">
              {log.sources.length} source{log.sources.length === 1 ? '' : 's'} ·{' '}
              {log.created_at ?? 'unknown time'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, isAdmin, loading, error, signIn, signOutAdmin } = useAdminAuth();

  if (loading) {
    return <p className="text-sm text-inkMuted">Checking access…</p>;
  }

  if (!user) {
    return (
      <div>
        <h1 className="mb-1 text-2xl font-bold text-teal">Admin Dashboard</h1>
        <p className="mb-6 text-sm text-inkMuted">Sign in with an admin account.</p>
        <SignInForm onSignIn={signIn} error={error} loading={loading} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <h1 className="mb-1 text-2xl font-bold text-teal">Admin Dashboard</h1>
        <p className="text-sm text-error">
          Signed in as {user.email}, but this account doesn&apos;t have admin
          access. Grant it via Firebase Admin SDK:{' '}
          <code className="rounded bg-surfaceMuted px-1 py-0.5">
            set_custom_user_claims(uid, {'{admin: true}'})
          </code>
          , then sign out and back in.
        </p>
        <button
          onClick={signOutAdmin}
          className="mt-4 rounded-full border border-border px-4 py-2 text-sm font-semibold"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-teal">Admin Dashboard</h1>
          <p className="text-sm text-inkMuted">Signed in as {user.email}</p>
        </div>
        <button
          onClick={signOutAdmin}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-inkMuted"
        >
          Sign out
        </button>
      </div>

      <ContentModeration />
      <ChatLogReview />
    </div>
  );
}
