'use client';

import { useState } from 'react';
import { ChatMessage } from '@/lib/types';
import { SectionDivider } from './SectionDivider';
import { SourceCard } from './SourceCard';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const [expanded, setExpanded] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'rounded-br-sm bg-teal text-surface'
            : 'rounded-bl-sm border border-border bg-surface text-ink'
        }`}
      >
        {message.pending ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-inkMuted [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-inkMuted [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-inkMuted" />
          </div>
        ) : message.error ? (
          <p className="text-sm text-error">{message.error}</p>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.text}</p>

            {!isUser && message.sources && message.sources.length > 0 && (
              <>
                <SectionDivider />
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-xs font-semibold text-teal hover:underline"
                >
                  {expanded ? 'Hide' : 'Show'} {message.sources.length} source
                  {message.sources.length > 1 ? 's' : ''}
                </button>
                {expanded && (
                  <div className="mt-2">
                    {message.sources.map((source, idx) => (
                      <SourceCard key={idx} source={source} />
                    ))}
                  </div>
                )}
              </>
            )}

            {!isUser && message.disclaimer && (
              <p className="mt-2 text-xs italic text-inkMuted">{message.disclaimer}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
