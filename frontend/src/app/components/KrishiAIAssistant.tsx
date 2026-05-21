import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Mic, MicOff, ShoppingCart, Star, Sparkles, Leaf, CheckCircle, Zap, Globe } from "lucide-react";
import { askFarmingAssistant, SUGGESTED_PROMPTS, AIAssistantResponse, AI_LANGUAGES, AI_UI, AILanguage } from "../../services/aiService";
import { useApp } from "../context/AppContext";
import { getFirstImage } from "../../utils/imageUtils";
import { toast } from "sonner";

interface Message {
  id: string; role: "user" | "assistant"; content: string;
  timestamp: Date; aiResponse?: AIAssistantResponse; lang?: AILanguage;
}
type ActivityStep = { text: string; done: boolean };

const SEV: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  Low:      { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  dot: "bg-green-500"  },
  Medium:   { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-500" },
  High:     { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  Critical: { color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500"    },
};
const URGENCY_ICON: Record<string, string> = {
  "Immediate": "🚨", "Within 3 days": "⚠️", "Within a week": "📅", "Not urgent": "✅",
};

// ── Activity Feed ──────────────────────────────────────────────────────────
const ActivityFeed: React.FC<{ steps: ActivityStep[] }> = ({ steps }) => (
  <div className="space-y-2 py-1">
    {steps.map((step, i) => (
      <div key={i} className="flex items-center gap-2 text-xs">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${step.done ? "bg-green-500" : "bg-yellow-400 animate-pulse"}`} />
        <span className={step.done ? "text-gray-400 line-through" : "text-gray-700 font-medium"}>{step.text}</span>
        {step.done && <CheckCircle className="h-3 w-3 text-green-500 ml-auto flex-shrink-0" />}
      </div>
    ))}
  </div>
);

// ── Analysis Panel ─────────────────────────────────────────────────────────
const AnalysisPanel: React.FC<{ response: AIAssistantResponse; lang: AILanguage }> = ({ response, lang }) => {
  const { analysis } = response;
  const sev = SEV[analysis.severity] || SEV.Medium;
  const ui = AI_UI[lang];
  return (
    <div className="space-y-2 mt-2">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-3 text-white">
        <div className="flex items-start gap-2">
          <Leaf className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs leading-relaxed">{analysis.summary}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{ui.cropDetected}</p>
          <p className="text-xs font-bold text-gray-800 truncate">🌱 {analysis.crop}</p>
        </div>
        <div className={`${sev.bg} ${sev.border} border rounded-xl p-2`}>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{ui.severity}</p>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
            <p className={`text-xs font-bold ${sev.color}`}>{analysis.severity}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{ui.urgency}</p>
          <p className="text-xs font-bold text-gray-800">{URGENCY_ICON[analysis.urgency] || "📅"} {analysis.urgency}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{ui.confidence}</p>
          <div className="flex items-center gap-1">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${analysis.confidence}%` }} />
            </div>
            <span className="text-[10px] font-bold text-gray-700">{analysis.confidence}%</span>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
        <div className="flex items-start gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">{ui.recommendedAction}</p>
            <p className="text-xs text-gray-700 leading-relaxed">{analysis.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Product Recommendations ────────────────────────────────────────────────
const ProductRecommendations: React.FC<{ response: AIAssistantResponse; lang: AILanguage }> = ({ response, lang }) => {
  const { addToCart, user } = useApp();
  const { products, analysis } = response;
  const [addingAll, setAddingAll] = useState(false);
  const ui = AI_UI[lang];
  if (!products || products.length === 0) return null;

  const handleAddAll = async () => {
    if (!user) { toast.error(ui.loginToCart); return; }
    setAddingAll(true);
    for (const p of products.slice(0, 4)) {
      await addToCart(p);
      await new Promise(r => setTimeout(r, 150));
    }
    setAddingAll(false);
    toast.success(`${Math.min(products.length, 4)} ${ui.addedToCart}`);
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
          <ShoppingCart className="h-3.5 w-3.5 text-green-600" />
          {ui.recommendedProducts} ({products.length})
        </p>
        {user && products.length > 1 && (
          <button onClick={handleAddAll} disabled={addingAll}
            className="text-[10px] font-bold bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-2.5 py-1 rounded-full transition-colors flex items-center gap-1">
            {addingAll ? ui.adding : <><ShoppingCart className="h-2.5 w-2.5" /> {ui.addAll}</>}
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {products.map(product => {
          const disc = product._id ? (product._id.charCodeAt(product._id.length - 1) % 15) + 5 : 10;
          const orig = Math.round(product.price * (1 + disc / 100));
          return (
            <div key={product._id} className="flex-shrink-0 w-36 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-green-300 transition-all snap-start">
              <div className="relative h-24 bg-gray-50 overflow-hidden">
                <img src={getFirstImage(product.images)} alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.target as HTMLImageElement).src = "/placeholder-product.svg"; }} />
                <div className="absolute top-1 left-1 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{disc}% off</div>
              </div>
              <div className="p-2">
                <p className="text-[9px] text-green-600 font-semibold truncate">{product.brand}</p>
                <p className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</p>
                {(product.numReviews ?? 0) > 0 && (
                  <div className="flex items-center gap-0.5 mb-1">
                    <div className="flex items-center gap-0.5 bg-green-600 text-white text-[9px] px-1 py-0.5 rounded">
                      <span>{(product.rating ?? 0).toFixed(1)}</span>
                      <Star className="h-2 w-2 fill-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-xs font-bold text-gray-900">Rs.{product.price}</span>
                  <span className="text-[9px] text-gray-400 line-through">Rs.{orig}</span>
                </div>
                <button onClick={() => addToCart(product)} disabled={product.stock === 0}
                  className="w-full text-[10px] font-bold bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <ShoppingCart className="h-2.5 w-2.5" />
                  {product.stock === 0 ? ui.outOfStock : ui.addToCart}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {analysis.recommendedCategories.map(cat => (
          <span key={cat} className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full capitalize">{cat}</span>
        ))}
      </div>
    </div>
  );
};

// ── Language Selector ──────────────────────────────────────────────────────
const LanguageSelector: React.FC<{ selected: AILanguage; onChange: (l: AILanguage) => void }> = ({ selected, onChange }) => (
  <div className="flex items-center gap-1.5 px-3 py-2 bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide flex-shrink-0">
    <Globe className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
    {AI_LANGUAGES.map(lang => (
      <button key={lang.code} onClick={() => onChange(lang.code)} title={lang.label}
        className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
          selected === lang.code
            ? "bg-green-600 text-white shadow-sm"
            : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"
        }`}>
        {lang.native}
      </button>
    ))}
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
export const KrishiAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiLang, setAiLang] = useState<AILanguage>("en");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activitySteps, setActivitySteps] = useState<ActivityStep[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const ui = AI_UI[aiLang];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SR);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activitySteps]);

  // Show welcome on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: "welcome", role: "assistant", content: ui.welcome, timestamp: new Date(), lang: aiLang }]);
    }
  }, [isOpen]);

  // When language changes: reset chat with new welcome message
  const handleLangChange = (lang: AILanguage) => {
    setAiLang(lang);
    setMessages([{ id: "welcome-" + lang, role: "assistant", content: AI_UI[lang].welcome, timestamp: new Date(), lang }]);
    setQuery("");
    setActivitySteps([]);
  };

  const runActivityFeed = useCallback(async (steps: string[]) => {
    setActivitySteps(steps.map(text => ({ text, done: false })));
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 450 + i * 280));
      setActivitySteps(prev => prev.map((s, idx) => idx <= i ? { ...s, done: true } : s));
    }
  }, []);

  const handleSubmit = async (queryText?: string) => {
    const q = (queryText || query).trim();
    if (!q || loading) return;
    const currentLang = aiLang;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: q, timestamp: new Date(), lang: currentLang }]);
    setQuery("");
    setLoading(true);
    runActivityFeed(AI_UI[currentLang].activitySteps);
    try {
      const result = await askFarmingAssistant(q, currentLang);
      setActivitySteps([]);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: result.analysis.recommendation, timestamp: new Date(),
        aiResponse: result, lang: currentLang,
      }]);
    } catch {
      setActivitySteps([]);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: "Sorry, I could not analyze your query. Please try again.", timestamp: new Date(), lang: currentLang,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    if (!speechSupported) { toast.error("Voice input not supported. Try Chrome."); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const recognition = new SR();
    recognition.lang = AI_LANGUAGES.find(l => l.code === aiLang)?.voiceLang || "en-IN";
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setQuery(t); setIsListening(false);
      setTimeout(() => handleSubmit(t), 300);
    };
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error === "not-allowed") toast.error("Microphone permission denied.");
      else if (e.error === "no-speech") toast.error("No speech detected. Try again.");
      else toast.error("Voice input failed. Please type your query.");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const panelBase = "fixed z-[9999] flex flex-col bg-white shadow-2xl";
  const panelClasses = isMobile
    ? `${panelBase} inset-x-0 bottom-0 rounded-t-2xl`
    : `${panelBase} bottom-24 right-4 rounded-2xl border border-gray-100 w-[390px]`;
  const panelStyle = isMobile
    ? { maxHeight: "92vh", height: "92vh" }
    : { height: "630px", maxHeight: "calc(100vh - 110px)" };

  const prompts = SUGGESTED_PROMPTS[aiLang] || SUGGESTED_PROMPTS.en;

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-5 right-5 z-[9998] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: "linear-gradient(135deg, #2f7c4f 0%, #1a4d30 100%)" }}
        aria-label="Open Krishi AI Assistant">
        {isOpen ? <X className="h-6 w-6 text-white" /> : (
          <div className="relative flex items-center justify-center">
            <span className="text-2xl">🌾</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
          </div>
        )}
      </button>

      {isOpen && (
        <>
          {isMobile && <div className="fixed inset-0 bg-black/40 z-[9997]" onClick={() => setIsOpen(false)} />}
          <div className={`${panelClasses} ai-panel-enter ai-glow`} style={panelStyle}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 rounded-t-2xl flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #2f7c4f 0%, #1a4d30 100%)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">🌾</div>
                <div>
                  <h2 className="text-white font-bold text-sm leading-none">Krishi AI Assistant</h2>
                  <p className="text-green-200 text-[10px] mt-0.5">Ask farming problems · Get smart recommendations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-green-200 font-medium">AI Online</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Language selector */}
            <LanguageSelector selected={aiLang} onChange={handleLangChange} />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">🌾</div>
                  )}
                  <div className={msg.role === "user" ? "max-w-[75%]" : "flex-1"}>
                    <div className={`rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-green-600 text-white rounded-tr-sm"
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                    }`}>{msg.content}</div>
                    {msg.aiResponse && (
                      <div className="mt-2">
                        <AnalysisPanel response={msg.aiResponse} lang={msg.lang || aiLang} />
                        <ProductRecommendations response={msg.aiResponse} lang={msg.lang || aiLang} />
                      </div>
                    )}
                    <p className="text-[9px] text-gray-400 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Activity feed */}
              {loading && activitySteps.length > 0 && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">🌾</div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm flex-1">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-3.5 w-3.5 text-green-600 animate-spin" />
                      <span className="text-xs font-bold text-green-700">{ui.analyzing}</span>
                    </div>
                    <ActivityFeed steps={activitySteps} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts — shown only on fresh chat */}
            {messages.length <= 1 && !loading && (
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex-shrink-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-2">{ui.quickQuestions}</p>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {prompts.map((prompt, i) => (
                    <button key={i} onClick={() => handleSubmit(prompt.text)}
                      className="flex-shrink-0 flex items-center gap-1 text-[11px] bg-green-50 hover:bg-green-100 text-green-700 font-medium px-2.5 py-1.5 rounded-full border border-green-200 transition-colors whitespace-nowrap">
                      <span>{prompt.icon}</span><span>{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0 rounded-b-2xl">
              <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-200 transition-all">
                <textarea ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder={ui.placeholder} rows={1} disabled={loading}
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none max-h-24 leading-relaxed"
                  style={{ minHeight: "24px" }} />
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {speechSupported && (
                    <button onClick={handleVoice} title={isListening ? ui.voiceStop : ui.voiceStart}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                      }`}>
                      {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    </button>
                  )}
                  <button onClick={() => handleSubmit()} disabled={!query.trim() || loading}
                    className="w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[9px] text-gray-400 text-center mt-1.5">{ui.poweredBy}</p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default KrishiAIAssistant;
