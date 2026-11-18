import { useEffect, useRef, useState } from 'react';
import { Bot, RotateCcw, Send, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SUGGESTED_QUESTIONS, generateAssistantReply } from '@/lib/assistant';

/** Floating REZHO AI assistant button + chat panel. */
export function AssistantFab({ withNav = true, bottom }: { withNav?: boolean; bottom?: number }) {
  const [open, setOpen] = useState(false);
  // Above the bottom nav (88px), above a sticky footer (~92px) or custom.
  const offset = bottom ?? (withNav ? 88 : 92);
  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir l’assistant REZHO"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        style={{ bottom: offset }}
        className="absolute right-4 z-30 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-brand-700 text-white shadow-float transition-transform hover:scale-105 active:scale-95"
      >
        <Bot size={26} />
      </button>
      {open && <AssistantPanel onClose={() => setOpen(false)} />}
    </>
  );
}

export function AssistantPanel({ onClose, embedded }: { onClose?: () => void; embedded?: boolean }) {
  const chat = useAppStore((s) => s.chat);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const resetChat = useAppStore((s) => s.resetChat);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat.length, typing]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    addChatMessage({ role: 'user', text: clean });
    setInput('');
    setTyping(true);
    const reply = generateAssistantReply(clean);
    setTimeout(() => {
      addChatMessage({ role: 'assistant', text: reply });
      setTyping(false);
    }, 700 + Math.min(900, reply.length * 4));
  };

  const body = (
    <>
      <div className="flex items-center gap-3 px-4 h-14 border-b border-ink-100 bg-white shrink-0">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-white">
          <Bot size={20} />
        </span>
        <div className="flex-1">
          <p className="text-[14px] font-bold text-ink-900 leading-tight">Assistant REZHO</p>
          <p className="text-[11px] text-brand-700 font-medium">En ligne · répond en quelques secondes</p>
        </div>
        <button type="button" aria-label="Réinitialiser la conversation" onClick={resetChat} className="h-8 w-8 rounded-full flex items-center justify-center text-ink-500 hover:bg-ink-50">
          <RotateCcw size={16} />
        </button>
        {onClose && (
          <button type="button" aria-label="Fermer l’assistant" onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center text-ink-700 bg-ink-50">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-4 space-y-3 bg-brand-50">
        {chat.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[82%] whitespace-pre-line rounded-[16px] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                m.role === 'user' ? 'bg-brand-700 text-white rounded-br-[6px]' : 'bg-white text-ink-900 shadow-card rounded-bl-[6px]'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-[16px] rounded-bl-[6px] bg-white shadow-card px-4 py-3 flex gap-1" aria-label="L’assistant écrit">
              <span className="h-2 w-2 rounded-full bg-ink-300 animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-ink-300 animate-bounce [animation-delay:120ms]" />
              <span className="h-2 w-2 rounded-full bg-ink-300 animate-bounce [animation-delay:240ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 bg-white border-t border-ink-100">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pt-3">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="shrink-0 rounded-full border border-brand-200 bg-brand-50 px-3 h-8 text-[12px] font-medium text-brand-800 hover:bg-brand-100"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre message…"
            aria-label="Message"
            className="flex-1 h-11 rounded-full border border-ink-200 bg-ink-50 px-4 text-[13px] focus:outline-none focus:border-brand-600"
          />
          <button
            type="submit"
            aria-label="Envoyer"
            disabled={!input.trim() || typing}
            className="h-11 w-11 rounded-full bg-brand-700 text-white flex items-center justify-center disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );

  if (embedded) return <div className="flex flex-col flex-1 min-h-0">{body}</div>;

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-white screen-in" role="dialog" aria-modal="true" aria-label="Assistant REZHO">
      <div className="hidden sm:block h-10 shrink-0 bg-white" />
      {body}
    </div>
  );
}
