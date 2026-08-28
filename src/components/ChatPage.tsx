import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types';
import { agentService } from '../services/agentService';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  Leaf,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  TreeDeciduous,
  MessageSquare
} from 'lucide-react';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: `Hello! I am your **Trellis Guide** — an AI systems architect and personalized growth mentor. 🌿

I can help you:
- Deconstruct complex distributed systems patterns (Event Sourcing, Raft, Saga orchestrations)
- Review system design trade-offs for high-concurrency architectures
- Recommend tailored milestones based on your skill radar
- Prepare for Staff & Principal Architect technical deep dives

What concept or architectural challenge are you cultivating today?`,
    timestamp: 'Just now',
    suggestedPrompts: [
      'Explain Event Sourcing vs CQRS with code examples',
      'How to design an idempotent payment webhook receiver?',
      'Compare Raft vs Paxos consensus mechanisms',
      'What are the trade-offs of Service Mesh mTLS?'
    ]
  }
];

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const replyText = await agentService.sendChatMessage(text, {
        currentNodeTitle: 'Distributed Systems & Scaling',
        currentScores: user?.skills
      });

      const assistantMessage: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'assistant',
        text: 'I encountered a brief network hiccup while cultivating that answer. Please ask again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-100px)] flex flex-col space-y-4 animate-in fade-in duration-300">
      
      {/* Top Chat Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#003527] to-[#2d6a4f] dark:from-[#52b788] dark:to-[#40916c] flex items-center justify-center text-white dark:text-[#06110d] shadow-sm">
            <TreeDeciduous className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-literata font-bold text-base text-[#003527] dark:text-white">
                Trellis Guide AI
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0] text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#52b788] animate-ping" />
                Live Mentor
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by Gemini 3.7 & Trellis Architecture Corpus
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(INITIAL_MESSAGES)}
          className="p-2 rounded-xl border border-gray-200 dark:border-[#1e4d3a] text-gray-500 hover:bg-gray-100 dark:hover:bg-[#13281f] transition-all text-xs flex items-center gap-1"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-3xl bg-white/70 dark:bg-[#0c1e16]/80 backdrop-blur-md border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-inner">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d]'
                    : 'bg-[#e5ece8] dark:bg-[#13281f] text-[#003527] dark:text-[#52b788] border border-[#2d6a4f]/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed transition-all ${
                  isUser
                    ? 'bg-[#003527] text-white dark:bg-[#52b788] dark:text-[#06110d] rounded-tr-none'
                    : 'bg-white dark:bg-[#13281f] border border-gray-200 dark:border-[#1e4d3a] text-gray-900 dark:text-gray-100 rounded-tl-none shadow-xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="space-y-2">
                    <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>

                    {/* Copy Button */}
                    <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-[#1e4d3a]/60 text-[10px] text-gray-400">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggested Prompts (if any on assistant message) */}
                {msg.suggestedPrompts && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#1e4d3a]/60 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                      Suggested Botanical Deep Dives:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedPrompts.map(prompt => (
                        <button
                          key={prompt}
                          onClick={() => handleSendMessage(prompt)}
                          className="text-[11px] text-left px-2.5 py-1 rounded-xl bg-[#003527]/5 dark:bg-[#52b788]/10 hover:bg-[#003527]/10 dark:hover:bg-[#52b788]/20 text-[#003527] dark:text-[#a7f3d0] font-medium transition-all"
                        >
                          🌱 {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Real-time typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#e5ece8] dark:bg-[#13281f] text-[#003527] dark:text-[#52b788] flex items-center justify-center border border-[#2d6a4f]/30">
              <Leaf className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-white dark:bg-[#13281f] border border-gray-200 dark:border-[#1e4d3a] shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#52b788] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-[#52b788] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-[#52b788] animate-bounce" />
              <span className="text-xs text-gray-400 ml-1 italic">Trellis Guide is reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2 rounded-2xl bg-white dark:bg-[#0c1e16] border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/60 shadow-lg flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Trellis AI about distributed systems, Raft consensus, or your roadmap..."
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none placeholder-gray-400"
        />

        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-3 rounded-xl bg-[#003527] hover:bg-[#084e3a] dark:bg-[#52b788] dark:hover:bg-[#40916c] text-white dark:text-[#06110d] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
