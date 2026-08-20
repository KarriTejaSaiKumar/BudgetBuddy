import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mic,
  Send,
  X,
  Bot,
  User,
  Sparkles,
  Trash2,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Minus,
  Maximize2,
  PieChart,
  PiggyBank,
  TrendingDown,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  FileText,
  BarChart2,
  HelpCircle,
} from 'lucide-react';
import api from '../services/api';
import { useFinancialPreferences } from '../context/FinancialPreferencesContext';
import { cn } from '@/lib/utils';

// Page Context-Aware Starter Suggestions
const getContextualStarterPrompts = (pathname = '') => {
  const path = pathname.toLowerCase();

  if (path.includes('/expenses')) {
    return [
      { icon: CreditCard, label: "How much did I spend this month?", hint: "Total expenses" },
      { icon: TrendingDown, label: "What is my largest expense?", hint: "Top purchase" },
      { icon: BarChart2, label: "Show my spending by category", hint: "Category breakdown" },
      { icon: ShieldCheck, label: "Am I within my food budget?", hint: "Budget check" },
    ];
  }
  if (path.includes('/budgets')) {
    return [
      { icon: PieChart, label: "Which budget is closest to the limit?", hint: "Budget alerts" },
      { icon: AlertCircle, label: "Am I over budget in any category?", hint: "Exceeded limits" },
      { icon: ShieldCheck, label: "How much budget do I have left?", hint: "Remaining allowances" },
      { icon: CreditCard, label: "Show my monthly expense overview", hint: "Current spending" },
    ];
  }
  if (path.includes('/savings')) {
    return [
      { icon: PiggyBank, label: "How are my savings goals doing?", hint: "Goal progress" },
      { icon: ShieldCheck, label: "How much can I safely save this month?", hint: "Surplus analysis" },
      { icon: Sparkles, label: "Give me advice to reach goals faster", hint: "Savings tips" },
      { icon: BarChart2, label: "Show my overall financial summary", hint: "Net cash flow" },
    ];
  }
  if (path.includes('/analytics')) {
    return [
      { icon: BarChart2, label: "Compare this month with last month", hint: "Spending comparison" },
      { icon: TrendingUp, label: "Why did my spending increase?", hint: "Trend analysis" },
      { icon: CreditCard, label: "What are my top spending categories?", hint: "Distribution" },
      { icon: ShieldCheck, label: "How much can I safely spend?", hint: "Safe-to-spend" },
    ];
  }
  if (path.includes('/income')) {
    return [
      { icon: TrendingUp, label: "How much did I earn this month?", hint: "Total income" },
      { icon: BarChart2, label: "Show my income sources breakdown", hint: "Source distribution" },
      { icon: PiggyBank, label: "Calculate my savings rate", hint: "Income vs savings" },
      { icon: ShieldCheck, label: "Give me a financial summary", hint: "Cash flow" },
    ];
  }
  if (path.includes('/reports')) {
    return [
      { icon: FileText, label: "Give me a monthly financial summary", hint: "Report overview" },
      { icon: BarChart2, label: "Show my spending patterns and trends", hint: "Analytics" },
      { icon: Sparkles, label: "Provide financial advice based on my reports", hint: "Recommendations" },
    ];
  }

  // Default / Dashboard
  return [
    { icon: CreditCard, label: "How much did I spend this month?", hint: "Monthly expenses" },
    { icon: PieChart, label: "Show my active budgets and limits", hint: "Budget health" },
    { icon: PiggyBank, label: "How are my savings goals doing?", hint: "Savings progress" },
    { icon: ShieldCheck, label: "How much can I safely spend?", hint: "Safe-to-spend analysis" },
    { icon: BarChart2, label: "Give me a financial summary", hint: "Income vs expenses" },
    { icon: TrendingDown, label: "What is my largest expense?", hint: "Top purchases" },
  ];
};

export default function AssistantDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currency } = useFinancialPreferences();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [sessionContext, setSessionContext] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const recognitionRef = useRef(null);
  const textBeforeRecord = useRef('');
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const starterPrompts = getContextualStarterPrompts(location.pathname);

  const SpeechRecognitionSupported = typeof window !== 'undefined' && !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  // Auto scroll to bottom
  useEffect(() => {
    if (!isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isMinimized]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showClearConfirm) {
          setShowClearConfirm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showClearConfirm, onClose]);

  // Stop recording if drawer closes
  useEffect(() => {
    if (!isOpen && isRecording) {
      stopRecording();
    }
  }, [isOpen, isRecording]);

  // Cleanup speech recognition
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startRecording = () => {
    if (!SpeechRecognitionSupported) {
      setError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) return;
    setError(null);
    textBeforeRecord.current = inputText;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => setIsRecording(true);

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const combined = textBeforeRecord.current +
          (textBeforeRecord.current && (finalTranscript || interimTranscript) ? ' ' : '') +
          finalTranscript +
          interimTranscript;

        setInputText(combined);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event);
        if (event.error === 'not-allowed') {
          setPermissionDenied(true);
          setError("Microphone permission denied. Please enable microphone access in your browser settings.");
        } else if (event.error !== 'no-speech') {
          setError(`Recognition notice: ${event.error}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => setIsRecording(false);

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setError('Could not access microphone.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsRecording(false);
    setInputText(textBeforeRecord.current);
  };

  const sendMessage = async (textToSend) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/chat/', {
        message: trimmed,
        session_context: sessionContext,
      });

      const data = response.data;
      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.response || "I have analyzed your data.",
        suggestions: data.suggestions || [],
        action: data.action || null,
        actions: data.actions || (data.action ? [data.action] : []),
        insights: data.insights || [],
        timestamp: new Date(),
        rawInput: trimmed,
      };

      if (data.context) {
        setSessionContext(data.context);
      }

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to get chat response:', err);
      const errorText =
        err.response?.data?.response ||
        err.response?.data?.detail ||
        "I couldn't process that request right now. Please check your connection or try again.";

      const errorMsg = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: errorText,
        isError: true,
        rawInput: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(inputText);
  };

  const handleRetry = (rawInput) => {
    if (rawInput) {
      sendMessage(rawInput);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    setSessionContext(null);
    setShowClearConfirm(false);
    setError(null);
  };

  const handleActionClick = (action) => {
    if (action?.route) {
      navigate(action.route);
    }
  };

  // Basic Markdown Renderer
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      let isBullet = false;

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        isBullet = true;
        content = line.trim().substring(2);
      }

      const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
      const parsedLine = parts.map((part, pidx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pidx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pidx} className="italic text-muted-foreground">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={pidx} className="rounded bg-secondary/80 px-1.5 py-0.5 font-mono text-[0.75rem] text-primary">{part.slice(1, -1)}</code>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc pl-1 my-1 text-sm text-foreground/90 leading-relaxed">
            {parsedLine}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="mt-3 mb-1 text-sm font-semibold text-foreground tracking-tight flex items-center gap-1.5">
            {line.substring(4)}
          </h4>
        );
      }

      return (
        <p key={idx} className="text-sm text-foreground/90 leading-relaxed my-0.5">
          {parsedLine}
        </p>
      );
    });
  };

  // Helper to render insight card icon
  const getInsightIcon = (type) => {
    switch (type) {
      case 'budget_health':
        return <PieChart className="size-4 text-warning" />;
      case 'savings_progress':
        return <PiggyBank className="size-4 text-success" />;
      case 'top_category':
        return <TrendingDown className="size-4 text-info" />;
      case 'safe_to_spend':
      default:
        return <ShieldCheck className="size-4 text-primary" />;
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex justify-end transition-opacity duration-300 pointer-events-none",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
      )}
      aria-modal="true"
      role="dialog"
      aria-label="BudgetBuddy AI Financial Assistant"
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-background/30 backdrop-blur-xs transition-opacity duration-300",
          isMinimized ? "pointer-events-none opacity-0" : "opacity-100"
        )}
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div
        className={cn(
          "assistant-glass-drawer relative flex flex-col bg-surface/90 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isMinimized
            ? "fixed bottom-5 right-5 h-16 w-80 rounded-2xl border border-hairline translate-x-0"
            : "h-full w-full max-w-md sm:w-[26rem] border-l border-hairline",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-4 sm:px-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative grid size-8.5 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(var(--color-primary),0.15)]">
              <Sparkles className="size-4.5 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-success ring-2 ring-background" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-sm font-semibold text-foreground">BudgetBuddy Assistant</h2>
                {currency && (
                  <span className="hidden rounded-full bg-secondary px-1.5 py-0.2 text-[0.625rem] font-semibold text-muted-foreground uppercase sm:inline-flex">
                    {currency}
                  </span>
                )}
                <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[0.625rem] font-semibold text-primary inline-flex">AI</span>
              </div>
              <span className="block truncate text-[10px] text-muted-foreground font-medium">Personal Financial Advisor</span>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Clear conversation"
                aria-label="Clear conversation history"
              >
                <Trash2 className="size-4" />
              </button>
            )}

            <button
              onClick={() => setIsMinimized((v) => !v)}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title={isMinimized ? "Expand assistant" : "Minimize assistant"}
              aria-label={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="size-3.5" /> : <Minus className="size-4" />}
            </button>

            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Close assistant (Esc)"
              aria-label="Close drawer"
            >
              <X className="size-4.5" />
            </button>
          </div>
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="absolute inset-x-3 top-18 z-50 rounded-2xl bg-popover p-4 shadow-xl border border-border animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-sm font-semibold text-foreground">Clear conversation?</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              This will reset the current chat session and clear previous follow-up context.
            </p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:brightness-110 transition-all shadow-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Minimized View Body */}
        {isMinimized ? (
          <div
            onClick={() => setIsMinimized(false)}
            className="flex-1 px-4 flex items-center justify-between cursor-pointer hover:bg-accent/40 transition-colors"
          >
            <span className="text-xs text-muted-foreground font-medium">Chat is active. Click to restore.</span>
            <span className="text-[10px] rounded-full bg-primary-soft px-2 py-0.5 text-primary font-semibold">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <>
            {/* Scrollable Message List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Context-Aware Initial Empty State Hero */}
              {messages.length === 0 && (
                <div className="my-auto py-4 space-y-5 animate-in fade-in duration-300">
                  <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary-soft/30 to-background p-5 border border-primary/15 shadow-sm text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)] mb-3">
                      <Sparkles className="size-6" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">How can I help with your finances?</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      Ask me anything about your real-time expenses, budgets, savings goals, or spending trends.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 px-1 mb-2.5">
                      <HelpCircle className="size-3.5 text-muted-foreground" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested Questions</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {starterPrompts.map((starter, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(starter.label)}
                          className="group flex items-center justify-between rounded-xl bg-surface p-3 text-left border border-hairline shadow-xs transition-all duration-150 hover:bg-accent hover:border-primary/30 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-foreground/80 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <starter.icon className="size-3.5" />
                            </div>
                            <span className="truncate text-xs font-medium text-foreground">{starter.label}</span>
                          </div>
                          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((msg, index) => {
                const isLastAssistant = msg.role === 'assistant' && index === messages.length - 1;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-1.5 max-w-[90%]",
                      msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "flex gap-2.5",
                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          "grid size-7.5 shrink-0 place-items-center rounded-xl text-xs font-semibold shadow-xs mt-0.5",
                          msg.role === 'user'
                            ? "bg-primary text-primary-foreground"
                            : msg.isError
                              ? "bg-destructive/15 text-destructive"
                              : "bg-primary/10 text-primary border border-primary/20"
                        )}
                      >
                        {msg.role === 'user' ? <User className="size-3.5" /> : <Bot className="size-4" />}
                      </div>

                      {/* Bubble */}
                      <div
                        className={cn(
                          "assistant-message-bubble group relative rounded-2xl px-4 py-3 shadow-xs text-sm border",
                          msg.role === 'user'
                            ? "bg-primary text-primary-foreground rounded-tr-xs border-primary/30"
                            : msg.isError
                              ? "bg-destructive/10 text-destructive border-destructive/25 rounded-tl-xs"
                              : "bg-surface text-foreground rounded-tl-xs border-border/40"
                        )}
                      >
                        {msg.role === 'user' ? (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="space-y-2">
                            {/* Markdown text content */}
                            <div className="space-y-1">{renderMarkdown(msg.content)}</div>

                            {/* Financial Insight Cards */}
                            {msg.insights && msg.insights.length > 0 && (
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/30">
                                {msg.insights.map((card, cidx) => (
                                  <div
                                    key={cidx}
                                    className="flex items-center gap-2.5 rounded-xl bg-secondary/50 p-2.5 border border-hairline shadow-xs"
                                  >
                                    <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface shadow-xs">
                                      {getInsightIcon(card.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="block truncate text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">{card.title}</span>
                                      <div className="flex items-baseline gap-1">
                                        <span className="truncate text-xs font-bold text-foreground">{card.value}</span>
                                      </div>
                                      <span className="block truncate text-[10px] text-muted-foreground">{card.subtitle}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Navigation Action Buttons */}
                            {msg.actions && msg.actions.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-border/30">
                                {msg.actions.map((action, aidx) => (
                                  <button
                                    key={aidx}
                                    onClick={() => handleActionClick(action)}
                                    className="flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/25 shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                                  >
                                    <span>{action.label || 'Open in BudgetBuddy'}</span>
                                    <ArrowRight className="size-3.5" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bubble Footer / Actions */}
                        <div className="mt-1.5 flex items-center justify-between gap-3 text-[9px] opacity-75">
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] hover:bg-accent transition-colors cursor-pointer"
                                title="Copy response"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="size-3 text-success" />
                                    <span className="text-success font-medium">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="size-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Copy</span>
                                  </>
                                )}
                              </button>

                              {msg.isError && msg.rawInput && (
                                <button
                                  onClick={() => handleRetry(msg.rawInput)}
                                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                  title="Retry question"
                                >
                                  <RotateCcw className="size-3" />
                                  <span>Retry</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contextual Suggestion Chips (Rendered under latest assistant message) */}
                    {isLastAssistant && msg.suggestions && msg.suggestions.length > 0 && !loading && (
                      <div className="mt-1 ml-10 flex flex-wrap gap-1.5 animate-in fade-in duration-200">
                        {msg.suggestions.map((suggestion, sidx) => (
                          <button
                            key={sidx}
                            onClick={() => sendMessage(suggestion)}
                            className="flex items-center gap-1 rounded-full bg-secondary/80 hover:bg-primary-soft hover:text-primary px-3 py-1 text-[11px] font-medium text-foreground/80 border border-hairline shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-left"
                          >
                            <Sparkles className="size-3 text-primary shrink-0" />
                            <span>{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex gap-2.5 max-w-[85%] mr-auto animate-in fade-in duration-200">
                  <div className="grid size-7.5 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs">
                    <Bot className="size-4" />
                  </div>
                  <div className="assistant-message-bubble rounded-2xl rounded-tl-xs bg-surface px-4 py-3 border border-border/40 flex items-center gap-1.5 shadow-xs">
                    <span className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="ml-2 text-xs text-muted-foreground font-medium">Analyzing finances...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Sticky Input Composer */}
            <div className="p-3 sm:p-4 border-t border-border/40 bg-surface/80 backdrop-blur-md shrink-0">
              {/* Error Banner */}
              {error && (
                <div className="mb-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Notice</p>
                    <p className="text-[11px] text-destructive/90">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-destructive hover:opacity-75 transition-opacity cursor-pointer"
                    aria-label="Dismiss error"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}

              <div className="relative flex items-center gap-2 rounded-2xl bg-secondary/60 border border-border p-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all duration-200 shadow-inner">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isRecording ? "Listening to your voice..." : "Ask BudgetBuddy (e.g. food spending, savings)..."}
                  disabled={isRecording || loading}
                  maxLength={500}
                  className="flex-1 max-h-24 min-h-[38px] bg-transparent text-sm text-foreground focus:outline-none resize-none py-2 px-2.5 placeholder:text-muted-foreground/75 leading-relaxed"
                  aria-label="Type message to assistant"
                />

                <div className="flex items-center gap-1 shrink-0">
                  {isRecording ? (
                    <>
                      <button
                        type="button"
                        onClick={cancelRecording}
                        className="px-2 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                        title="Cancel recording"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-3 py-1.5 rounded-xl bg-destructive text-white hover:brightness-110 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        title="Stop recording"
                      >
                        <span className="size-1.5 rounded-full bg-white animate-ping" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Done</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={!SpeechRecognitionSupported && !permissionDenied}
                      className={cn(
                        "p-2 rounded-xl text-muted-foreground transition-all duration-200 relative group",
                        SpeechRecognitionSupported
                          ? "hover:text-foreground hover:bg-accent/80 cursor-pointer"
                          : "opacity-40 cursor-not-allowed"
                      )}
                      title={SpeechRecognitionSupported ? "Speak via microphone" : "Voice typing not supported"}
                      aria-label="Start voice input"
                    >
                      <Mic className="size-4.5" />
                    </button>
                  )}

                  {!isRecording && (
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() || loading}
                      className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 shadow-sm cursor-pointer"
                      title="Send message (Enter)"
                      aria-label="Send message"
                    >
                      <Send className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Voice active indicator */}
              {isRecording && (
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground px-1 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="voice-wave-bar" />
                    <span className="voice-wave-bar" />
                    <span className="voice-wave-bar" />
                    <span className="voice-wave-bar" />
                    <span className="voice-wave-bar" />
                    <span className="ml-1 font-medium animate-pulse text-foreground/80">Listening... Speak clearly</span>
                  </div>
                  <span className="text-[10px] opacity-75">Click Done when finished</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
