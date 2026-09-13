'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Star,
  Download,
  Plus,
  Check,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { AIChatMessage, SoftwareItemData } from '@/types';
import { useDownloadBasket } from '@/context/DownloadBasketContext';

export function ZenithChatWidget() {
  const { addItem, isItemInBasket } = useDownloadBasket();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 Welcome to **Zenith AI Assistant**! I can search our catalog in natural language, recommend software/games by file size, platform, or features, and help you navigate the platform.\n\nTry asking me anything!',
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Find video editors under 900MB',
    'Best cyberpunk RPG games',
    'Offline productivity APKs',
    'Rust code editors for Windows',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend }),
      });

      if (!res.ok) {
        throw new Error('Failed to process AI chat');
      }

      const data = await res.json();
      const assistantMsg: AIChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestedItems: data.suggestedItems,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI chat query error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered a temporary connection issue. Please try again!',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 rounded-full border border-cyan-500/40 bg-slate-950/90 py-2.5 px-4 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl hover:border-cyan-400 hover:scale-105 transition-all group"
          title="Ask Zenith AI"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/30 group-hover:rotate-12 transition-transform">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              Zenith AI <span className="rounded bg-cyan-500/20 px-1 py-0.2 text-[9px] text-cyan-400">RAG</span>
            </span>
            <span className="text-[10px] text-slate-400">Ask catalog questions</span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                  Zenith AI Assistant
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400">Grounded on live PostgreSQL catalog</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`rounded-2xl p-3.5 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Interactive Catalog Suggestion Cards */}
                  {msg.suggestedItems && msg.suggestedItems.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Matching Catalog Items:
                      </p>
                      {msg.suggestedItems.map((item) => {
                        const inBasket = isItemInBasket(item.id);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2.5 rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 hover:border-cyan-500/40 transition-colors"
                          >
                            <Link
                              href={`/software/${item.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-2.5 flex-1 min-w-0"
                            >
                              <img
                                src={item.iconUrl}
                                alt={item.title}
                                className="h-8 w-8 rounded-lg object-cover border border-slate-800"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-[11px] text-white truncate hover:text-cyan-400 transition-colors">
                                  {item.title}
                                </h5>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span className="text-amber-400 flex items-center gap-0.5">
                                    <Star className="h-2.5 w-2.5 fill-amber-400" />
                                    {item.averageRating.toFixed(1)}
                                  </span>
                                  <span>•</span>
                                  <span className="text-cyan-400 font-mono">
                                    {item.downloadFiles?.[0]?.formattedSize || 'Direct'}
                                  </span>
                                </div>
                              </div>
                            </Link>

                            <button
                              onClick={() => addItem(item)}
                              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-all ${
                                inBasket
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-slate-800 text-slate-200 hover:bg-cyan-600 hover:text-slate-950'
                              }`}
                            >
                              {inBasket ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mt-0.5">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 pl-8">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span className="text-[11px]">Searching Postgres catalog...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about software, games, size, APKs..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-2.5 pl-4 pr-11 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="absolute right-1.5 rounded-xl bg-cyan-600 p-2 text-slate-950 hover:bg-cyan-500 disabled:opacity-30 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
