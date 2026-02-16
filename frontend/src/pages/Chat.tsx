import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Sparkles, BookOpen, FileQuestion, FileText, RotateCcw } from 'lucide-react';
import { mockChatMessages, type ChatMessage } from '@/lib/mock-data';

const quickChips = [
  { label: 'Explain this concept', icon: Sparkles },
  { label: 'Create quiz', icon: FileQuestion },
  { label: 'Summarize material', icon: FileText },
];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: 'ai',
        content: "That's a great question! Based on your uploaded materials, I can help you understand this better. Would you like me to break it down step by step or provide practice problems?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        references: ['Data Structures & Algorithms'],
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">StudyAI Assistant</h1>
            <p className="text-xs text-secondary">● Online</p>
          </div>
        </div>
        <button onClick={() => setMessages([])} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition" title="Clear chat">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Context pills */}
      <div className="px-4 py-2 border-b border-border bg-card flex gap-2 overflow-x-auto shrink-0">
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
          <BookOpen className="h-3 w-3" /> Data Structures & Algorithms
        </span>
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
          <BookOpen className="h-3 w-3" /> Operating Systems Notes
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">How can I help you study?</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Ask me anything about your uploaded materials. I can explain concepts, create quizzes, and summarize notes.</p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'gradient-primary text-primary-foreground rounded-br-md' : 'bg-card shadow-card text-foreground rounded-bl-md'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.references && msg.references.length > 0 && (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {msg.references.map((ref) => (
                    <span key={ref} className="text-[10px] bg-primary/20 px-2 py-0.5 rounded-full">{ref}</span>
                  ))}
                </div>
              )}
              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{msg.timestamp}</p>
            </div>
          </motion.div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-card shadow-card rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-soft" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      {messages.length === 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0">
          {quickChips.map((chip) => (
            <button key={chip.label} onClick={() => setInput(chip.label)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-foreground hover:bg-muted transition whitespace-nowrap">
              <chip.icon className="h-4 w-4 text-primary" /> {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card shrink-0">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your studies..."
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <button className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition">
            <Mic className="h-5 w-5" />
          </button>
          <button onClick={sendMessage} disabled={!input.trim()}
            className="p-2.5 rounded-xl gradient-primary text-primary-foreground disabled:opacity-40 transition">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
