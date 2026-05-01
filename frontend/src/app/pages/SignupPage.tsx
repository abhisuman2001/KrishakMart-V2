import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  User, Phone, Mail, Lock, Store, FileText, Globe, ChevronDown,
  Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, ArrowLeft,
  Tractor, Leaf, MapPin, X, ShieldCheck, Navigation,
  Sprout, Wrench, Droplets, FlaskConical, Package, BarChart3, Truck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import API from '../../services/api';
import { LocationPicker, LocationData } from '../components/LocationPicker';

const LANGUAGES = [{ code: 'en', native: 'English' }, { code: 'hi', native: 'हिंदी' }];

// ── OTP Modal ────────────────────────────────────────────────────────────────
interface OtpModalProps {
  type: 'mobile' | 'email';
  target: string;
  onVerified: () => void;
  onClose: () => void;
}
const OtpModal: React.FC<OtpModalProps> = ({ type, target, onVerified, onClose }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [mockOtp, setMockOtp] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateAndSend = useCallback(() => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setMockOtp(otp);
    setCountdown(30);
    setCanResend(false);
    toast.info(`Your KrishakMart OTP is: ${otp}`, { duration: 10000 });
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    generateAndSend();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [generateAndSend]);

  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    setError('');
    if (d && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setDigits(pasted.split('')); inputRefs.current[5]?.focus(); }
  };

  const handleVerify = () => {
    const entered = digits.join('');
    if (entered.length < 6) { setError('Please enter all 6 digits'); return; }
    if (entered !== mockOtp) {
      setError('Incorrect code. Please try again.');
      setShake(true);
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => { setShake(false); inputRefs.current[0]?.focus(); }, 600);
      return;
    }
    setSuccess(true);
    setTimeout(() => { onVerified(); onClose(); }, 1000);
  };

  const label = type === 'mobile' ? `+91 ${target}` : target;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="h-8 w-8 text-[#2E7D32]" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Verified!</h3>
            <p className="text-gray-500 text-sm mt-1">{type === 'mobile' ? 'Mobile number' : 'Email'} confirmed.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="h-6 w-6 text-[#FF9800]" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Enter Verification Code
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Code sent to <span className="font-semibold text-gray-700">{label}</span>
              </p>
            </div>
            <div
              className={`flex gap-2 justify-center mb-4`}
              style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
              onPaste={handlePaste}
            >
              {digits.map((d, i) => (
                <input key={i} ref={el => { inputRefs.current[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-11 h-12 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                    ${d ? 'border-[#FF9800] bg-orange-50' : 'border-gray-200 bg-gray-50'}
                    focus:border-[#FF9800] focus:bg-orange-50/50`}
                />
              ))}
            </div>
            {error && (
              <p className="text-center text-xs text-red-500 mb-3 flex items-center justify-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}
            <button onClick={handleVerify} disabled={digits.join('').length < 6}
              className="w-full bg-[#FF9800] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all active:scale-95">
              Verify Code
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              {canResend ? (
                <button onClick={generateAndSend} className="text-[#2E7D32] font-semibold hover:underline">Resend OTP</button>
              ) : (
                <>Resend in <span className="font-semibold text-gray-600">{countdown}s</span></>
              )}
            </p>
          </>
        )}
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`}</style>
    </div>
  );
};

// ── Verified field ───────────────────────────────────────────────────────────
interface VerifiedFieldProps {
  id: string; label: string; type: 'mobile' | 'email';
  value: string; onChange: (v: string) => void;
  validate: (v: string) => string | null;
  verified: boolean; onVerified: () => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}
const VerifiedField: React.FC<VerifiedFieldProps> = ({
  id, label, type, value, onChange, validate, verified, onVerified, inputMode, maxLength,
}) => {
  const [touched, setTouched] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const error = touched && !verified ? validate(value) : null;
  const isValid = !validate(value);
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
      <div className="flex gap-2 items-start">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {type === 'mobile' ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          </span>
          <input id={id} type={type === 'mobile' ? 'tel' : 'email'} inputMode={inputMode} maxLength={maxLength}
            value={value} onChange={e => onChange(type === 'mobile' ? e.target.value.replace(/\D/g, '') : e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={type === 'mobile' ? '10-digit mobile number' : 'your@email.com'}
            disabled={verified}
            className={`w-full pl-10 pr-10 py-3.5 rounded-xl border text-sm outline-none transition-colors
              ${verified ? 'border-green-400 bg-green-50/30 text-gray-600' :
                error ? 'border-red-400 bg-red-50/20' :
                isValid && touched ? 'border-green-400 bg-green-50/20' : 'border-gray-200 bg-white'}
              focus:border-green-500 disabled:cursor-not-allowed`}
          />
          {verified && <span className="absolute right-3 top-1/2 -translate-y-1/2"><CheckCircle className="h-4 w-4 text-green-500" /></span>}
        </div>
        {verified ? (
          <span className="flex items-center gap-1 text-xs font-bold text-[#2E7D32] bg-green-100 px-3 py-3.5 rounded-xl whitespace-nowrap flex-shrink-0">
            <CheckCircle className="h-3.5 w-3.5" /> Verified
          </span>
        ) : (
          <button type="button" onClick={() => { setTouched(true); if (isValid) setShowOtp(true); }} disabled={!isValid}
            className="flex-shrink-0 bg-[#FF9800] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-3.5 rounded-xl transition-all whitespace-nowrap">
            Verify
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {showOtp && (
        <OtpModal type={type} target={value}
          onVerified={() => { onVerified(); setShowOtp(false); }}
          onClose={() => setShowOtp(false)} />
      )}
    </div>
  );
};

// ── VInput ───────────────────────────────────────────────────────────────────
interface VInputProps {
  id: string; label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  icon: React.ReactNode; validate?: (v: string) => string | null;
  required?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number; optional?: boolean;
}
const VInput: React.FC<VInputProps> = ({
  id, label, type = 'text', placeholder, value, onChange, icon,
  validate, required, inputMode, maxLength, optional,
}) => {
  const [touched, setTouched] = useState(false);
  const error = touched && validate ? validate(value) : null;
  const valid = touched && !error && value.length > 0;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gray-700 block mb-1.5">
        {label}{optional && <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input id={id} type={type} inputMode={inputMode} maxLength={maxLength}
          placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setTouched(true)} required={required}
          className={`w-full pl-10 pr-10 py-3.5 rounded-xl border text-sm outline-none transition-colors
            ${valid ? 'border-green-400 bg-green-50/20' : error ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'}
            focus:border-green-500`}
        />
        {touched && value.length > 0 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {valid ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ── Password field ───────────────────────────────────────────────────────────
const PasswordField: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [show, setShow] = useState(false);
  const strength = value.length === 0 ? 0 : value.length < 6 ? 1 : value.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          placeholder="Create a strong password"
          className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 bg-white" required />
        <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {value.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className={`text-xs font-medium ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
            {strengthLabel[strength]}
          </p>
        </div>
      )}
    </div>
  );
};

// ── Step dots ────────────────────────────────────────────────────────────────
const StepDots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <div className="flex items-center justify-center gap-2 mb-5">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`rounded-full transition-all duration-300 ${
        i < current ? 'w-2 h-2 bg-[#FF9800]' :
        i === current ? 'w-8 h-2 bg-[#FF9800]' : 'w-2 h-2 bg-gray-200'
      }`} />
    ))}
  </div>
);

// ── Success overlay ──────────────────────────────────────────────────────────
const SuccessOverlay: React.FC<{ name: string; isFarmer: boolean }> = ({ name, isFarmer }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm mx-4">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isFarmer ? 'bg-green-100' : 'bg-amber-100'}`}>
        {isFarmer
          ? <Tractor className="h-10 w-10 text-green-600" />
          : <Store className="h-10 w-10 text-amber-600" />}
      </div>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        Welcome to the Family!
      </h2>
      <p className="text-gray-500 text-sm">Hello, <span className="font-semibold text-gray-700">{name}</span>! Your account is ready.</p>
      <div className={`mt-4 h-1 rounded-full animate-pulse ${isFarmer ? 'bg-[#2E7D32]' : 'bg-[#FF9800]'}`} />
    </div>
  </div>
);

// ── Language dropdown ────────────────────────────────────────────────────────
const LangDropdown: React.FC<{ language: string; setLanguage: (l: 'en' | 'hi') => void; size?: 'sm' | 'md' }> = ({ language, setLanguage, size = 'md' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 ${size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}>
        <Globe className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        {current.native}
        <ChevronDown className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { setLanguage(l.code as 'en' | 'hi'); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm ${language === l.code ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              {l.native}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Farmer Signup ────────────────────────────────────────────────────────────
const FarmerSignup: React.FC<{
  language: string; setLanguage: (l: 'en' | 'hi') => void; onSuccess: () => void;
}> = ({ language, setLanguage, onSuccess }) => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const validateMobile = (v: string) => /^[6-9]\d{9}$/.test(v) ? null : 'Enter a valid 10-digit mobile number';
  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email address';
  const validateName = (v: string) => v.trim().length >= 2 ? null : 'Name must be at least 2 characters';

  const canSubmit = name.trim().length >= 2 && mobileVerified && emailVerified && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await API.post('/auth/register', {
        name: name.trim(), phone: mobile, email: email.trim(), password, role: 'farmer',
      });
      onSuccess();
      setTimeout(async () => {
        await login({ phone: mobile, password });
        navigate('/farmer/store');
      }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#43A047] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 bg-white/10 rounded-full" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-white p-3.5 rounded-2xl shadow-xl">
              <img src="/krishakmart-logo.png" alt="KrishakMart" className="h-12 w-12 object-contain" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>KrishakMart</h1>
              <p className="text-white/70 text-xs tracking-widest uppercase">Mitti Se Digital Tak</p>
            </div>
          </div>
          <p className="text-white text-2xl font-bold leading-snug" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Join 10,000+<br /><span className="text-yellow-300">Farmers Today!</span>
          </p>
          <p className="text-white/80 text-sm mt-3 leading-relaxed">
            Get access to quality seeds, fertilizers, tools and more — at the best prices, delivered to your farm.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[{ v: '10,000+', l: 'Farmers' }, { v: '500+', l: 'Products' }, { v: '4.8★', l: 'Rating' }].map(s => (
              <div key={s.l} className="bg-white/15 rounded-xl py-3 px-2">
                <div className="text-white font-bold text-base">{s.v}</div>
                <div className="text-white/70 text-xs">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              { icon: Sprout,      label: 'Fresh Seeds' },
              { icon: Wrench,      label: 'Farm Tools' },
              { icon: Droplets,    label: 'Irrigation' },
              { icon: FlaskConical,label: 'Fertilizers' },
            ].map(tag => (
              <span key={tag.label} className="flex items-center gap-1.5 bg-white/20 text-white text-xs px-3 py-1.5 rounded-full">
                <tag.icon className="h-3 w-3" /> {tag.label}
              </span>
            ))}
          </div>
          <div className="mt-8 bg-white/10 border border-white/20 rounded-2xl px-5 py-4">
            <p className="text-white/80 text-sm mb-2">Already have an account?</p>
            <Link to="/login">
              <span className="inline-block bg-white text-[#2E7D32] font-bold text-sm px-5 py-2 rounded-xl hover:bg-green-50 transition-colors">Login here →</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] flex items-center justify-center bg-gray-50 py-10 px-5 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="flex lg:hidden items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#2E7D32]"><Tractor className="h-6 w-6 text-white" /></div>
              <div>
                <p className="font-extrabold text-gray-800 text-lg leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>KrishakMart</p>
                <p className="text-gray-400 text-[10px]">Mitti Se Digital Tak</p>
              </div>
            </div>
            <LangDropdown language={language} setLanguage={setLanguage} size="sm" />
          </div>

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>Create account</h2>
              <p className="text-gray-500 text-sm mt-0.5">Join KrishakMart as a Farmer</p>
            </div>
            <div className="hidden lg:block"><LangDropdown language={language} setLanguage={setLanguage} /></div>
          </div>

          <div className="flex bg-gray-100 rounded-2xl p-1 mb-5 gap-1">
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[#2E7D32] text-white shadow-md">
              <Tractor className="h-4 w-4" /> Farmer
            </div>
            <Link to="/signup/shop-owner" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              <Store className="h-4 w-4" /> Shop Owner
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <VInput id="name" label="Full Name" placeholder="Your full name"
                value={name} onChange={setName} icon={<User className="h-4 w-4" />} validate={validateName} required />
              <VerifiedField id="mobile" label="Mobile Number" type="mobile"
                value={mobile} onChange={v => { setMobile(v); setMobileVerified(false); }}
                validate={validateMobile} verified={mobileVerified} onVerified={() => setMobileVerified(true)}
                inputMode="numeric" maxLength={10} />
              <VerifiedField id="email" label="Email ID" type="email"
                value={email} onChange={v => { setEmail(v); setEmailVerified(false); }}
                validate={validateEmail} verified={emailVerified} onVerified={() => setEmailVerified(true)} />
              <PasswordField value={password} onChange={setPassword} />
              {(!mobileVerified || !emailVerified) && name.trim().length >= 2 && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Verify {!mobileVerified && !emailVerified ? 'mobile & email' : !mobileVerified ? 'mobile number' : 'email'} to continue
                  </p>
                </div>
              )}
              <button type="submit" disabled={loading || !canSubmit}
                className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed mt-2 ${canSubmit ? 'bg-[#2E7D32] hover:bg-green-800' : 'bg-gray-300'}`}>
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating account...</>
                ) : (
                  <>Create Farmer Account <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
              <p className="text-center text-sm text-gray-500 pt-1">
                Already have an account?{' '}
                <Link to="/login" className="text-[#2E7D32] font-semibold hover:underline">Login</Link>
              </p>
            </form>
          </div>
          <p className="text-center text-xs text-gray-400 mt-5">
            <Leaf className="inline h-3 w-3 mr-1" />KrishakMart · Mitti Se Digital Tak
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Shop Owner Signup ────────────────────────────────────────────────────────
const ShopOwnerSignup: React.FC<{
  language: string; setLanguage: (l: 'en' | 'hi') => void;
  onSuccess: () => void; successName: string; setSuccessName: (n: string) => void;
}> = ({ language, setLanguage, onSuccess, setSuccessName }) => {
  const { login } = useApp();
  const navigate = useNavigate();

  const totalSteps = 4;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [location, setLocation] = useState<LocationData | undefined>();
  const [shopAddress, setShopAddress] = useState('');
  const [shopName, setShopName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const stepTitles = ['Your Identity', 'Your Location', 'Business Details', 'Set Password'];
  const stepSubtitles = ['Tell us who you are', 'Where is your shop?', 'Verify your business', 'Secure your account'];

  const canAdvance = () => {
    if (step === 0) return name.trim().length >= 2 && mobileVerified && emailVerified;
    if (step === 1) return !!(location?.latitude && location.latitude !== 0);
    if (step === 2) return shopName.trim().length >= 2;
    return false;
  };

  const handleSubmit = async () => {
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await API.post('/auth/register', {
        name: name.trim(), phone: mobile, email: email.trim(), password,
        role: 'shopOwner', shopName, shopAddress, shopLocation: location,
      });
      setSuccessName(name);
      onSuccess();
      setTimeout(async () => {
        await login({ phone: mobile, password });
        navigate('/shop-owner/dashboard');
      }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#E65100] via-[#FF9800] to-[#FFB74D] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 bg-white/10 rounded-full" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-white p-3.5 rounded-2xl shadow-xl">
              <img src="/krishakmart-logo.png" alt="KrishakMart" className="h-12 w-12 object-contain" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>KrishakMart</h1>
              <p className="text-white/70 text-xs tracking-widest uppercase">Mitti Se Digital Tak</p>
            </div>
          </div>
          <p className="text-white text-2xl font-bold leading-snug" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Start Selling<br /><span className="text-white">on KrishakMart</span>
          </p>
          <p className="text-white/80 text-sm mt-3 leading-relaxed">
            List your products, reach thousands of farmers, and grow your agri business.
          </p>
          <div className="mt-8 space-y-3">
            {stepTitles.map((title, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                i === step ? 'bg-white/25 border border-white/30' : i < step ? 'bg-white/10' : 'opacity-40'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i < step ? 'bg-white text-[#FF9800]' : i === step ? 'bg-white text-gray-800' : 'bg-white/20 text-white'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/60 text-xs">{stepSubtitles[i]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center bg-gray-50 py-10 px-5 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="flex lg:hidden items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#FF9800]"><Tractor className="h-6 w-6 text-white" /></div>
              <div>
                <p className="font-extrabold text-gray-800 text-lg leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>KrishakMart</p>
                <p className="text-gray-400 text-[10px]">Mitti Se Digital Tak</p>
              </div>
            </div>
            <LangDropdown language={language} setLanguage={setLanguage} size="sm" />
          </div>

          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>Create account</h2>
              <p className="text-gray-500 text-sm mt-0.5">{stepSubtitles[step]}</p>
            </div>
            <div className="hidden lg:block"><LangDropdown language={language} setLanguage={setLanguage} /></div>
          </div>

          <div className="flex bg-gray-100 rounded-2xl p-1 mb-4 gap-1">
            <Link to="/signup/farmer" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              <Tractor className="h-4 w-4" /> Farmer
            </Link>
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[#FF9800] text-white shadow-md">
              <Store className="h-4 w-4" /> Shop Owner
            </div>
          </div>

          <StepDots total={totalSteps} current={step} />

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            {/* Step 0: Identity */}
            {step === 0 && (
              <div className="space-y-4">
                <VInput id="so-name" label="Full Name" placeholder="Your full name" value={name}
                  onChange={setName} icon={<User className="h-4 w-4" />}
                  validate={v => v.trim().length >= 2 ? null : 'Name must be at least 2 characters'} required />
                <VerifiedField id="so-mobile" label="Mobile Number" type="mobile"
                  value={mobile} onChange={v => { setMobile(v); setMobileVerified(false); }}
                  validate={v => /^[6-9]\d{9}$/.test(v) ? null : 'Enter a valid 10-digit mobile number'}
                  verified={mobileVerified} onVerified={() => setMobileVerified(true)}
                  inputMode="numeric" maxLength={10} />
                <VerifiedField id="so-email" label="Email ID" type="email"
                  value={email} onChange={v => { setEmail(v); setEmailVerified(false); }}
                  validate={v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email address'}
                  verified={emailVerified} onVerified={() => setEmailVerified(true)} />
                {(!mobileVerified || !emailVerified) && name.trim().length >= 2 && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      Verify {!mobileVerified && !emailVerified ? 'mobile & email' : !mobileVerified ? 'mobile number' : 'email'} to continue
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <div className="space-y-4">
                <LocationPicker
                  label="Find Shop Address on Map"
                  placeholder="Tap to pin your exact location"
                  value={location}
                  onChange={(loc) => {
                    setLocation(loc);
                    setShopAddress(loc.address);
                  }}
                />
                {!location?.latitude && (
                  <p className="text-xs text-red-500 flex items-center gap-1 -mt-1">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    Pin your shop location on the map to continue
                  </p>
                )}
                <VInput id="so-addr" label="Shop Address" placeholder="Edit or type your address"
                  value={shopAddress} onChange={setShopAddress} icon={<MapPin className="h-4 w-4" />} />
              </div>
            )}

            {/* Step 2: Business */}
            {step === 2 && (
              <div className="space-y-4">
                <VInput id="shopName" label="Shop Name" placeholder="Your shop or business name"
                  value={shopName} onChange={setShopName} icon={<Store className="h-4 w-4" />}
                  validate={v => v.trim().length >= 2 ? null : 'Shop name required'} required />
                <VInput id="license" label="License / GST Number" placeholder="Optional — add later"
                  value={licenseNumber} onChange={setLicenseNumber}
                  icon={<FileText className="h-4 w-4" />} optional />
              </div>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <div className="space-y-4">
                <PasswordField value={password} onChange={setPassword} />
                <div>
                  <label htmlFor="so-confirm-pw" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="so-confirm-pw"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm outline-none transition-colors ${
                        confirmPassword.length > 0
                          ? confirmPassword === password
                            ? 'border-green-400 bg-green-50 focus:border-green-500'
                            : 'border-red-400 bg-red-50 focus:border-red-500'
                          : 'border-gray-200 bg-white focus:border-[#FF9800]'
                      }`}
                    />
                    {confirmPassword.length > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {confirmPassword === password
                          ? <CheckCircle className="h-4 w-4 text-green-500" />
                          : <AlertCircle className="h-4 w-4 text-red-400" />}
                      </span>
                    )}
                  </div>
                  {confirmPassword.length > 0 && confirmPassword !== password && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
                <p className="text-xs text-gray-400">Use at least 6 characters with a mix of letters and numbers.</p>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}
              {step < totalSteps - 1 ? (
                <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-orange-500 active:scale-95 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading || password.length < 6 || password !== confirmPassword}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-orange-500 active:scale-95 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</>
                  ) : (
                    <>Create Shop Account <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              )}
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-[#FF9800] font-semibold hover:underline">Login</Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            <Leaf className="inline h-3 w-3 mr-1" />KrishakMart · Mitti Se Digital Tak
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Root export ──────────────────────────────────────────────────────────────
export const SignupPage: React.FC = () => {
  const { userType } = useParams<{ userType: 'farmer' | 'shop-owner' }>();
  const { language, setLanguage } = useApp();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');
  const isFarmer = userType === 'farmer';

  return (
    <>
      {showSuccess && <SuccessOverlay name={successName} isFarmer={isFarmer} />}
      {isFarmer ? (
        <FarmerSignup language={language} setLanguage={setLanguage}
          onSuccess={() => { setSuccessName(''); setShowSuccess(true); }} />
      ) : (
        <ShopOwnerSignup language={language} setLanguage={setLanguage}
          onSuccess={() => setShowSuccess(true)}
          successName={successName} setSuccessName={setSuccessName} />
      )}
    </>
  );
};
