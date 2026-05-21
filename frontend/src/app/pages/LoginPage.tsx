import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock, Globe, Leaf, ShoppingBag, ChevronDown, Eye, EyeOff,
  Phone, CheckCircle, AlertCircle, Tractor, ArrowRight,
  Store, Sprout, Wrench, Droplets, Package, BarChart3, Truck, ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { translations } from '../../utils/translations';

const LANGUAGES = [
  { code: 'en', native: 'English' },
  { code: 'hi', native: 'हिंदी' },
];

// ── Inline field validation helper ──────────────────────────────────────────
const MobileField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  accentColor: string;
}> = ({ value, onChange, accentColor }) => {
  const valid = /^\d{10}$/.test(value);
  const touched = value.length > 0;
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">Mobile Number</label>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="tel" inputMode="numeric" maxLength={10}
          value={value}
          onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
          placeholder="10-digit mobile number"
          className={`w-full pl-10 pr-10 py-3.5 rounded-xl border text-sm transition-colors outline-none
            ${touched && valid ? 'border-green-400 bg-green-50/30' : touched && !valid ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-white'}
            focus:border-${accentColor === 'green' ? 'green' : 'amber'}-500`}
          required
        />
        {touched && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {valid
              ? <CheckCircle className="h-4 w-4 text-green-500" />
              : <AlertCircle className="h-4 w-4 text-red-400" />}
          </span>
        )}
      </div>
      {touched && !valid && value.length > 0 && (
        <p className="text-xs text-red-500 mt-1">Enter a valid 10-digit mobile number</p>
      )}
    </div>
  );
};

// ── Skeleton loader ──────────────────────────────────────────────────────────
const FormSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 w-24 bg-gray-200 rounded" />
    <div className="h-12 bg-gray-200 rounded-xl" />
    <div className="h-4 w-20 bg-gray-200 rounded" />
    <div className="h-12 bg-gray-200 rounded-xl" />
    <div className="h-12 bg-gray-300 rounded-xl mt-2" />
  </div>
);

export const LoginPage: React.FC = () => {
  const { login, language, setLanguage } = useApp();
  const navigate = useNavigate();

  const [role, setRole] = useState<'farmer' | 'shopOwner'>('farmer');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [skeletonVisible, setSkeletonVisible] = useState(false);

  // Long-press admin trigger
  const adminPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [adminHoldProgress, setAdminHoldProgress] = useState(0);
  const adminHoldInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const langRef = useRef<HTMLDivElement>(null);
  const t = translations[language as keyof typeof translations];
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const isFarmer = role === 'farmer';
  const accent = isFarmer ? 'green' : 'amber';
  const accentBg = isFarmer ? 'bg-[#2E7D32]' : 'bg-[#FF9800]';
  const accentHover = isFarmer ? 'hover:bg-green-800' : 'hover:bg-orange-500';
  const accentBorder = isFarmer ? 'border-[#2E7D32]' : 'border-[#FF9800]';
  const accentText = isFarmer ? 'text-[#2E7D32]' : 'text-[#FF9800]';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Show skeleton briefly when switching roles
  const switchRole = (r: 'farmer' | 'shopOwner') => {
    if (r === role) return;
    setSkeletonVisible(true);
    setMobile(''); setPassword('');
    setTimeout(() => { setRole(r); setSkeletonVisible(false); }, 350);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) { toast.error('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      await login({ phone: mobile, password });
      toast.success('Welcome back!');
      // Read role from localStorage — login() writes it there before returning
      const savedUser = localStorage.getItem('user');
      const role = savedUser ? JSON.parse(savedUser).role : null;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'shopOwner') navigate('/shop-owner/dashboard');
      else navigate('/farmer/store');
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || '';
      if (status === 401) {
        toast.error(msg.toLowerCase().includes('password') ? 'Incorrect password. Try again.' : 'Mobile number not found. Check and retry.');
      } else if (status === 403) {
        toast.error('Account blocked. Contact support.');
      } else {
        toast.error(msg || 'Login failed. Is the server running?');
      }
    } finally { setLoading(false); }
  };

  // Admin: long-press 2s on hidden area
  const startAdminHold = () => {
    setAdminHoldProgress(0);
    adminHoldInterval.current = setInterval(() => {
      setAdminHoldProgress(p => Math.min(p + 5, 100));
    }, 100);
    adminPressTimer.current = setTimeout(async () => {
      clearInterval(adminHoldInterval.current!);
      setAdminHoldProgress(0);
      setLoading(true);
      try {
        await login({ phone: '9999999999', password: 'admin123' });
        toast.success('Admin access granted');
        navigate('/admin/dashboard');
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 401) toast.error('Admin account not found. Run: node scripts/createAdmin.js');
        else toast.error(err.response?.data?.message || 'Admin login failed. Check backend.');
      } finally { setLoading(false); }
    }, 2000);
  };

  const cancelAdminHold = () => {
    if (adminPressTimer.current) clearTimeout(adminPressTimer.current);
    if (adminHoldInterval.current) clearInterval(adminHoldInterval.current);
    setAdminHoldProgress(0);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Left Panel ── */}
      <div className={`hidden lg:flex lg:w-[45%] flex-col items-center justify-center p-12 relative overflow-hidden transition-all duration-500
        ${isFarmer ? 'bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047]' : 'bg-gradient-to-br from-[#E65100] via-[#FF9800] to-[#FFB74D]'}`}>
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 bg-white/10 rounded-full" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-white p-3.5 rounded-2xl shadow-xl">
              <img src="/krishakmart-logo.png" alt="KrishakMart" className="h-12 w-12 object-contain" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                KrishakMart
              </h1>
              <p className="text-white/70 text-xs tracking-widest uppercase">Mitti Se Digital Tak</p>
            </div>
          </div>

          <p className="text-white text-2xl font-bold leading-snug mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {isFarmer
              ? <>Welcome Back,<br /><span className="text-yellow-300">Kisan!</span></>
              : <>Welcome Back,<br /><span className="text-white">Seller!</span></>}
          </p>
          <p className="text-white/80 text-sm mt-3 leading-relaxed">
            {isFarmer
              ? 'Shop quality seeds, fertilizers, tools and more — delivered to your farm.'
              : 'Manage your products, track orders, and grow your agri business.'}
          </p>

          <div className="grid grid-cols-3 gap-3 mt-8">
            {(isFarmer
              ? [{ v: '10,000+', l: 'Farmers' }, { v: '500+', l: 'Products' }, { v: '4.8★', l: 'Rating' }]
              : [{ v: '500+', l: 'Sellers' }, { v: '₹2Cr+', l: 'Sales' }, { v: '98%', l: 'Satisfaction' }]
            ).map(s => (
              <div key={s.l} className="bg-white/15 rounded-xl py-3 px-2">
                <div className="text-white font-bold text-base">{s.v}</div>
                <div className="text-white/70 text-xs">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {(isFarmer
              ? [
                  { icon: Sprout,   label: 'Fresh Seeds' },
                  { icon: Wrench,   label: 'Farm Tools' },
                  { icon: Droplets, label: 'Irrigation' },
                ]
              : [
                  { icon: Package,  label: 'Easy Listing' },
                  { icon: BarChart3,label: 'Analytics' },
                  { icon: Truck,    label: 'Fast Delivery' },
                ]
            ).map(tag => (
              <span key={tag.label} className="flex items-center gap-1.5 bg-white/20 text-white text-xs px-3 py-1.5 rounded-full">
                <tag.icon className="h-3 w-3" /> {tag.label}
              </span>
            ))}
          </div>

          <div className="mt-8 bg-white/10 border border-white/20 rounded-2xl px-5 py-4">
            <p className="text-white/80 text-sm mb-3">New to KrishakMart?</p>
            <div className="flex gap-2 justify-center">
              <Link to="/signup/farmer">
                <span className="inline-flex items-center gap-1.5 bg-white text-[#2E7D32] font-bold text-xs px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
                  <Tractor className="h-3.5 w-3.5" /> Join as Farmer
                </span>
              </Link>
              <Link to="/signup/shop-owner">
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-white/30 transition-colors border border-white/30">
                  <Store className="h-3.5 w-3.5" /> Become Seller
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center bg-gray-50 py-10 px-5 sm:px-8">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-xl ${accentBg}`}>
                <Tractor className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-gray-800 text-lg leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>KrishakMart</p>
                <p className="text-gray-400 text-[10px]">Mitti Se Digital Tak</p>
              </div>
            </div>
            {/* Language */}
            <div className="relative" ref={langRef}>
              <button onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700">
                <Globe className="h-3.5 w-3.5 text-gray-500" />
                {currentLang.native}
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLanguage(l.code as 'en' | 'hi'); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm ${language === l.code ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {l.native}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Heading row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>Welcome back</h2>
              <p className="text-gray-500 text-sm mt-0.5">Login to your KrishakMart account</p>
            </div>
            {/* Desktop language */}
            <div className="relative hidden lg:block" ref={langRef}>
              <button onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Globe className="h-4 w-4 text-gray-500" />
                {currentLang.native}
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLanguage(l.code as 'en' | 'hi'); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 text-sm ${language === l.code ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {l.native}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Role toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-5 gap-1">
            {(['farmer', 'shopOwner'] as const).map(r => (
              <button key={r} onClick={() => switchRole(r)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  role === r
                    ? r === 'farmer'
                      ? 'bg-[#2E7D32] text-white shadow-md'
                      : 'bg-[#FF9800] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {r === 'farmer' ? <Tractor className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                {r === 'farmer' ? 'Farmer' : 'Shop Owner'}
              </button>
            ))}
          </div>


          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            {skeletonVisible ? <FormSkeleton /> : (
              <form onSubmit={handleLogin} className="space-y-4">
                <MobileField value={mobile} onChange={setMobile} accentColor={accent} />

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-10 py-3.5 rounded-xl border border-gray-200 text-sm outline-none transition-colors focus:border-${accent}-500 bg-white`}
                      required
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 ${accentBg} ${accentHover} text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-1`}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isFarmer ? 'Login as Farmer' : 'Login as Shop Owner'}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 pt-1">
                  Don't have an account?{' '}
                  <Link to={isFarmer ? '/signup/farmer' : '/signup/shop-owner'}
                    className={`font-semibold hover:underline ${accentText}`}>
                    Sign up
                  </Link>
                </p>
              </form>
            )}
          </div>

          {/* Hidden admin trigger — long press 2s */}
          <div className="mt-6 flex justify-center">
            <button
              onMouseDown={startAdminHold} onMouseUp={cancelAdminHold} onMouseLeave={cancelAdminHold}
              onTouchStart={startAdminHold} onTouchEnd={cancelAdminHold}
              className="relative w-8 h-8 rounded-full overflow-hidden opacity-20 hover:opacity-40 transition-opacity"
              title=""
              aria-label="Admin access"
            >
              <div className="absolute inset-0 bg-gray-300 rounded-full" />
              <div
                className="absolute bottom-0 left-0 right-0 bg-gray-500 rounded-full transition-all duration-100"
                style={{ height: `${adminHoldProgress}%` }}
              />
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-3">
            <Leaf className="inline h-3 w-3 mr-1" />
            KrishakMart · Mitti Se Digital Tak
          </p>
        </div>
      </div>
    </div>
  );
};
