'use client';

import { useCallback, useRef, useState } from 'react';
import { ApiError, sendChatMessage } from '@/lib/api';
import { ChatMessage, Language } from '@/lib/types';
import { MessageBubble } from '@/components/MessageBubble';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const COPY = {
  en: {
    placeholder: 'Ask about the Quran or Hadith…',
    send: 'Send',
    empty: 'Ask anything — for example, "What does the Quran say about patience?"',
    genericError: 'Something went wrong reaching the server. Please try again.',
  },
  ur: {
    placeholder: 'قرآن یا حدیث کے بارے میں پوچھیں…',
    send: 'بھیجیں',
    empty: 'کچھ بھی پوچھیں — مثال کے طور پر "صبر کے بارے میں قرآن کیا کہتا ہے؟"',
    genericError: 'سرور تک رسائی میں مسئلہ ہوا۔ براہ کرم دوبارہ کوشش کریں۔',
  },
} as const;

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const copy = COPY[language];

  const handleSend = useCallback(async () => {
    const question = input.trim();
    if (!question || sending) return;

    const userMessage: ChatMessage = { id: makeId(), role: 'user', text: question };
    const pendingId = makeId();
    const pendingMessage: ChatMessage = {
      id: pendingId,
      role: 'assistant',
      text: '',
      pending: true,
    };

    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await sendChatMessage({ question, language });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? {
                ...m,
                pending: false,
                text: response.answer,
                sources: response.sources,
                disclaimer: response.disclaimer,
              }
            : m,
        ),
      );
    } catch (err) {
      const message = err instanceof ApiError ? err.message : copy.genericError;
      setMessages((prev) =>
        prev.map((m) => (m.id === pendingId ? { ...m, pending: false, error: message } : m)),
      );
    } finally {
      setSending(false);
      requestAnimationFrame(() =>
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
      );
    }
  }, [input, sending, language, copy.genericError]);

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h1 className="font-semibold text-teal">Ask ILM Buddy</h1>
          <p className="text-xs text-inkMuted">Answers grounded in Quran & Hadith</p>
        </div>
        <button
          onClick={() => setLanguage((l) => (l === 'en' ? 'ur' : 'en'))}
          className="rounded-full bg-surfaceMuted px-3 py-1.5 text-xs font-semibold text-teal"
        >
          {language === 'en' ? 'EN' : 'اردو'}
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm text-inkMuted">
            {copy.empty}
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={copy.placeholder}
          dir={language === 'ur' ? 'rtl' : 'ltr'}
          rows={1}
          className="max-h-28 flex-1 resize-none rounded-2xl bg-surfaceMuted px-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal/30"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="rounded-2xl bg-teal px-4 py-2.5 text-sm font-semibold text-surface disabled:bg-border"
        >
          {copy.send}
        </button>
      </form>
    </div>
  );
}
