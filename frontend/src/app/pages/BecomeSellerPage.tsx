import React from 'react';
import { Link } from 'react-router-dom';
import {
  Store, DollarSign, Users, TrendingUp, CheckCircle,
  ArrowRight, Package, BarChart3, Bell, ShieldCheck, Headphones, Zap,
  Tractor, Gift, ClipboardList, Banknote,
} from 'lucide-react';

export const BecomeSellerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-[#1a4d30] via-[#2f7c4f] to-[#236240] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920')] bg-cover bg-center opacity-10" />
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-yellow-400/10 rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 lg:px-8 py-20 md:py-28">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                <Zap className="h-3.5 w-3.5" /> Free to Join — No Hidden Fees
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                Sell Smarter.<br />
                <span className="text-yellow-400">Grow Faster.</span>
              </h1>
              <p className="text-green-100 text-lg md:text-xl mb-8 max-w-xl">
                Join KrishakMart and connect your shop with thousands of farmers across India. List products, manage orders, and grow your revenue — all from one dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/signup/shop-owner">
                  <button className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-xl shadow-lg">
                    <Store className="h-5 w-5" /> Register Your Shop Free
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="flex items-center justify-center gap-2 border-2 border-white/50 text-white hover:bg-white hover:text-[#2f7c4f] font-semibold text-base px-6 py-4 rounded-xl transition-all duration-200">
                    Already a seller? Login
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats card */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full md:w-auto">
              {[
                { value: '1000+', label: 'Active Farmers',   icon: Tractor,      color: 'bg-green-400/20 text-green-200' },
                { value: '3x',    label: 'Revenue Growth',   icon: TrendingUp,   color: 'bg-blue-400/20 text-blue-200' },
                { value: '₹0',    label: 'Registration Fee', icon: Gift,         color: 'bg-yellow-400/20 text-yellow-200' },
                { value: '24/7',  label: 'Seller Support',   icon: Headphones,   color: 'bg-purple-400/20 text-purple-200' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 text-center">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-green-200 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Why Sell on KrishakMart?</h2>
            <p className="text-gray-500 text-lg">Everything you need to run and grow your agri-business online</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, color: 'bg-green-100 text-green-600', title: 'Reach More Farmers', desc: 'Connect with 1000+ farmers actively looking for quality farming supplies near them.' },
              { icon: DollarSign, color: 'bg-blue-100 text-blue-600', title: 'Grow Your Revenue', desc: 'Sellers report up to 3x increase in sales after listing on KrishakMart.' },
              { icon: Package, color: 'bg-orange-100 text-orange-600', title: 'Easy Inventory', desc: 'Add, edit, and manage your products in minutes with our simple dashboard.' },
              { icon: TrendingUp, color: 'bg-purple-100 text-purple-600', title: 'Business Insights', desc: 'Track earnings, orders, and growth with real-time analytics and reports.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-400 hover:shadow-lg transition-all duration-300 group">
                <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Start Selling in 4 Steps</h2>
            <p className="text-gray-500 text-lg">Get your shop live in under 10 minutes</p>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', icon: ClipboardList, title: 'Register Free',  desc: 'Sign up with your shop name, address, and basic details. No documents needed.' },
                { step: '02', icon: Package,       title: 'List Products',  desc: 'Add your farming products with photos, prices, and stock quantity.' },
                { step: '03', icon: Bell,          title: 'Get Orders',     desc: 'Receive instant notifications when farmers place orders from your shop.' },
                { step: '04', icon: Banknote,      title: 'Earn & Grow',    desc: 'Deliver products, collect payments, and watch your business grow.' },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="relative text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200 relative z-10">
                    <Icon className="h-9 w-9 text-white" />
                  </div>
                  <div className="text-xs font-bold text-green-600 mb-1">STEP {step}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features list ── */}
      <section className="py-16 bg-[#2f7c4f]">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything You Need to Succeed</h2>
              <p className="text-green-100 text-lg mb-8">A complete toolkit built for agri-shop owners</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Package, text: 'Product listing & management' },
                  { icon: Bell, text: 'Real-time order notifications' },
                  { icon: BarChart3, text: 'Earnings & sales reports' },
                  { icon: ShieldCheck, text: 'Secure payment processing' },
                  { icon: Users, text: 'Customer management' },
                  { icon: TrendingUp, text: 'Inventory tracking' },
                  { icon: Zap, text: 'Fast order processing' },
                  { icon: Headphones, text: '24/7 seller support' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-gray-900" />
                    </div>
                    <span className="text-white text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* CTA card */}
            <div className="flex-shrink-0 w-full md:w-80">
              <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Start?</h3>
                <p className="text-gray-500 text-sm mb-6">Join hundreds of shop owners already growing with KrishakMart</p>
                <div className="space-y-3">
                  {['Free registration', 'No monthly fees', 'Instant activation', 'Full dashboard access'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <Link to="/signup/shop-owner" className="block mt-6">
                  <button className="w-full flex items-center justify-center gap-2 bg-[#2f7c4f] hover:bg-[#236240] text-white font-bold text-base py-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    Create Seller Account <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <p className="text-xs text-gray-400 mt-3">Takes less than 2 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Tractor className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            India's farmers are waiting for you
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Don't let your competitors get there first. Register your shop today and start receiving orders from farmers in your area.
          </p>
          <Link to="/signup/shop-owner">
            <button className="inline-flex items-center gap-3 bg-[#2f7c4f] hover:bg-[#236240] text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl shadow-md">
              <Store className="h-6 w-6" />
              Register Your Shop — It's Free
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <p className="text-gray-400 text-sm mt-4">Already have an account? <Link to="/login" className="text-green-600 font-semibold hover:underline">Login here</Link></p>
        </div>
      </section>

    </div>
  );
};
