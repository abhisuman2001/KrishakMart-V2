import React, { useState, useRef, useEffect, ReactNode, Suspense } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, ShoppingCart, User, Heart, Package, LayoutDashboard,
  LogOut, ChevronDown, Menu, X, Home, Phone, Globe, Send,
} from 'lucide-react';
import { Footer } from './Footer';
import { useApp } from '../context/AppContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { translations } from '../../utils/translations';
import { toast } from 'sonner';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

interface FarmerLayoutProps { children: ReactNode }

export const FarmerLayout: React.FC<FarmerLayoutProps> = ({ children }) => {
  const { user, cart, wishlist, logout, language, setLanguage } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({ name: user?.name || '', mobile: user?.phone || '', message: '' });

  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const LANGUAGES = [
    { code: 'en' as const, native: 'English' },
    { code: 'hi' as const, native: 'हिंदी' },
  ];
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/farmer/store?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.message.trim()) { toast.error('Please enter a message'); return; }
    toast.success('Message sent! We will contact you soon.');
    setSupportForm(f => ({ ...f, message: '' }));
    setSupportOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[#2f7c4f] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center h-16 gap-2">

            {/* Logo */}
            <Link to="/farmer/store" className="flex items-center gap-2 shrink-0">
              <img src="/krishakmart-logo.png" alt="KrishakMart" className="h-9 w-9" />
              <div className="hidden sm:block">
                <div className="text-white font-bold text-lg leading-none">KrishakMart</div>
                <div className="text-green-200 text-[10px] italic">Mitti Se Digital Tak</div>
              </div>
            </Link>

            {/* Search — sm+ only */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-2xl mx-4">
              <div className="flex w-full">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search seeds, fertilizers, tools..."
                  className="flex-1 px-4 py-2.5 text-sm rounded-l-lg border-0 outline-none text-gray-800 bg-white min-w-0" />
                <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2.5 rounded-r-lg transition-colors flex-shrink-0">
                  <Search className="h-4 w-4 text-gray-800" />
                </button>
              </div>
            </form>

            {/* Spacer on mobile */}
            <div className="flex-1 sm:hidden" />

            {/* Desktop/Tablet actions */}
            <div className="hidden sm:flex items-center gap-1 md:gap-2 shrink-0">
              <div className="relative" ref={langRef}>
                <button onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 text-white hover:text-green-200 px-2 py-1.5 rounded-lg hover:bg-green-700 text-xs transition-colors">
                  <Globe className="h-4 w-4" />
                  <span className="hidden md:inline">{currentLang.native}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm transition-colors ${language === lang.code ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                        {lang.native}
                        {language === lang.code && <span className="text-green-600 text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setSupportOpen(true)}
                className="flex items-center gap-1 text-white hover:text-green-200 px-2 py-1.5 rounded-lg hover:bg-green-700 text-xs transition-colors">
                <Phone className="h-4 w-4" />
                <span className="hidden md:inline">{t.support}</span>
              </button>

              <Link to="/farmer/wishlist" className="relative flex items-center gap-1 text-white hover:text-green-200 px-2 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">{wishlist.length}</span>}
                <span className="hidden md:inline text-xs">Wishlist</span>
              </Link>

              <Link to="/cart" className="relative flex items-center gap-1 text-white hover:text-green-200 px-2 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">{cart.length}</span>}
                <span className="hidden md:inline text-xs">{t.myCart}</span>
              </Link>

              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 text-white hover:text-green-200 px-2 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs text-green-200 leading-none">Hello,</div>
                    <div className="text-sm font-semibold leading-none truncate max-w-[80px]">{user?.name?.split(' ')[0]}</div>
                  </div>
                  <ChevronDown className="h-3 w-3 hidden md:block" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-bold">{user?.name?.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="text-white font-semibold text-sm">{user?.name}</p>
                          <p className="text-green-200 text-xs">{user?.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      {[
                        { icon: LayoutDashboard, label: 'My Dashboard', path: '/farmer/dashboard' },
                        { icon: Package, label: t.myOrders, path: '/farmer/orders' },
                        { icon: Heart, label: t.wishlist, path: '/farmer/wishlist' },
                        { icon: ShoppingCart, label: t.myCart, path: '/cart' },
                        { icon: User, label: 'Profile', path: '/farmer/profile' },
                      ].map(item => (
                        <button key={item.path} onClick={() => { navigate(item.path); setProfileOpen(false); }}
                          className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${location.pathname === item.path ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <item.icon className="h-4 w-4" /> {item.label}
                        </button>
                      ))}
                      <div className="border-t border-gray-100 my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="h-4 w-4" /> {t.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="flex sm:hidden items-center gap-1 shrink-0">
              <Link to="/cart" className="relative text-white p-1.5 rounded-lg hover:bg-green-700 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-gray-900 text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">{cart.length}</span>}
              </Link>
              <button onClick={() => setMobileMenuOpen(v => !v)} className="text-white p-1.5 rounded-lg hover:bg-green-700 transition-colors">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-[#236240] border-t border-green-600">
            {/* Mobile search */}
            <div className="px-4 pt-3 pb-2">
              <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="flex">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-3 py-2.5 text-sm rounded-l-lg border-0 outline-none text-gray-800 bg-white min-w-0" />
                <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 px-3 py-2.5 rounded-r-lg transition-colors flex-shrink-0">
                  <Search className="h-4 w-4 text-gray-800" />
                </button>
              </form>
            </div>

            {/* User strip */}
            <div className="mx-4 mb-2 bg-green-700/50 rounded-xl px-3 py-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-green-300 text-xs">🧑‍🌾 Farmer</p>
              </div>
            </div>

            <nav className="px-4 pb-3 space-y-1">
              {[
                { icon: Home, label: 'Store', path: '/farmer/store', badge: 0 },
                { icon: LayoutDashboard, label: 'Dashboard', path: '/farmer/dashboard', badge: 0 },
                { icon: Package, label: t.myOrders, path: '/farmer/orders', badge: 0 },
                { icon: Heart, label: 'Wishlist', path: '/farmer/wishlist', badge: wishlist.length },
                { icon: User, label: 'Profile', path: '/farmer/profile', badge: 0 },
              ].map(item => (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path ? 'bg-white text-green-700' : 'text-green-100 hover:bg-green-700'}`}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge > 0 && <span className="bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">{item.badge}</span>}
                </Link>
              ))}

              <div className="border-t border-green-600 pt-2 mt-1">
                <p className="text-green-300 text-xs px-3 mb-1.5">Language</p>
                <div className="flex gap-2 px-3">
                  {LANGUAGES.map(lang => (
                    <button key={lang.code} onClick={() => { setLanguage(lang.code); setMobileMenuOpen(false); }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${language === lang.code ? 'bg-white text-green-700' : 'text-green-100 hover:bg-green-700'}`}>
                      {lang.native}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => { setSupportOpen(true); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-green-100 hover:bg-green-700 transition-colors">
                <Phone className="h-4 w-4" /> {t.support}
              </button>

              <div className="border-t border-green-600 pt-1 mt-1">
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-900/30 transition-colors">
                  <LogOut className="h-4 w-4" /> {t.logout}
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </main>

      <Footer />

      {/* Support Dialog */}
      {supportOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setSupportOpen(false)} />
          <div className="fixed inset-x-4 top-20 sm:right-6 sm:left-auto sm:w-96 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-green-600 to-green-700">
                <h2 className="text-white font-bold">{t.sendMessage}</h2>
                <button onClick={() => setSupportOpen(false)} className="text-green-200 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSupportSubmit} className="p-5 space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">{t.yourName}</Label>
                  <Input value={supportForm.name} onChange={e => setSupportForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={t.enterName} className="mt-1 border-gray-200 focus:border-green-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">{t.mobileNumber}</Label>
                  <Input value={supportForm.mobile} onChange={e => setSupportForm(f => ({ ...f, mobile: e.target.value }))}
                    placeholder={t.enterMobile} className="mt-1 border-gray-200 focus:border-green-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">{t.message}</Label>
                  <Textarea value={supportForm.message} onChange={e => setSupportForm(f => ({ ...f, message: e.target.value }))}
                    placeholder={t.howCanWeHelp} className="mt-1 border-gray-200 focus:border-green-500 min-h-[80px]" required />
                </div>
                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl gap-2">
                  <Send className="h-4 w-4" /> {t.sendMessageBtn}
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
