import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock, ChevronLeft, MapPin, CreditCard, CheckCircle,
  ShoppingBag, Truck, Shield, Phone, User, Home,
  Building, AlertCircle, Loader2, Banknote, Smartphone, Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocationPicker, LocationData } from '../components/LocationPicker';
import { getFirstImage } from '../../utils/imageUtils';
import API from '../../services/api';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 'shipping' | 'payment' | 'success';

interface Address {
  fullName: string;
  phone: string;
  pincode: string;
  addressLine: string;
  city: string;
  state: string;
  landmark: string;
}

// ── Module-level constants (avoids remounts) ──────────────────────────────────
const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const CHECKOUT_STEPS = [
  { key: 'cart',     label: 'Cart',     icon: ShoppingBag },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'payment',  label: 'Payment',  icon: CreditCard },
  { key: 'success',  label: 'Success',  icon: CheckCircle },
];

// ── Field — module-level to prevent remount on every keystroke ────────────────
const Field: React.FC<{
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  required?: boolean;
}> = ({ id, label, placeholder, value, onChange, icon, inputMode, maxLength, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </span>
      <input
        id={id} type="text" value={value} onChange={onChange}
        placeholder={placeholder} maxLength={maxLength} inputMode={inputMode}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-green-200 transition-colors bg-white"
      />
    </div>
  </div>
);

// ── Progress Stepper ──────────────────────────────────────────────────────────
const Stepper: React.FC<{ current: Step }> = ({ current }) => {
  const order = ['cart', 'shipping', 'payment', 'success'];
  const currentIdx = order.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-lg mx-auto">
      {CHECKOUT_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = order[i] === current;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                done
                  ? active ? 'bg-[#2E7D32] text-white shadow-lg shadow-green-200 scale-110' : 'bg-[#2E7D32] text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {done && !active ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${
                active ? 'text-[#2E7D32]' : done ? 'text-gray-500' : 'text-gray-300'
              }`}>{step.label}</span>
            </div>
            {i < CHECKOUT_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 transition-all duration-500 ${i < currentIdx ? 'bg-[#2E7D32]' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Shipping Form ─────────────────────────────────────────────────────────────
const ShippingForm: React.FC<{
  address: Address;
  onChange: (a: Address) => void;
  onNext: () => void;
}> = ({ address, onChange, onNext }) => {
  const set = (k: keyof Address) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...address, [k]: e.target.value });

  // Relaxed: accept any 10-digit number (not just Indian mobile prefix)
  const valid =
    address.fullName.trim().length >= 2 &&
    /^\d{10}$/.test(address.phone) &&
    /^\d{6}$/.test(address.pincode) &&
    address.addressLine.trim().length >= 3 &&
    address.city.trim().length >= 2 &&
    address.state.trim().length >= 2;

  const handleMapLocation = (loc: LocationData) => {
    onChange({
      ...address,
      addressLine: loc.address,
      city: loc.city || address.city,
      state: loc.state ? (STATES.includes(loc.state) ? loc.state : address.state) : address.state,
      pincode: loc.pincode || address.pincode,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="fullName" label="Full Name" placeholder="Your full name"
          value={address.fullName} onChange={set('fullName')} icon={<User className="h-4 w-4" />} />
        <Field id="phone" label="Mobile Number" placeholder="10-digit number"
          value={address.phone} onChange={set('phone')} icon={<Phone className="h-4 w-4" />}
          inputMode="numeric" maxLength={10} />
      </div>

      {/* Map location picker */}
      <LocationPicker
        label="Pin Delivery Location on Map"
        placeholder="Open map to pin your exact location"
        value={address.addressLine ? { latitude: 0, longitude: 0, address: address.addressLine } : undefined}
        onChange={handleMapLocation}
      />

      {/* Editable address line */}
      <Field id="addressLine" label="House / Flat / Village" placeholder="House no., street, village name"
        value={address.addressLine} onChange={set('addressLine')} icon={<Home className="h-4 w-4" />} />

      <Field id="landmark" label="Landmark" placeholder="Near school, temple, etc. (optional)"
        value={address.landmark} onChange={set('landmark')} icon={<MapPin className="h-4 w-4" />} required={false} />

      <div className="grid grid-cols-2 gap-4">
        <Field id="city" label="City / District" placeholder="Your city"
          value={address.city} onChange={set('city')} icon={<Building className="h-4 w-4" />} />
        <Field id="pincode" label="PIN Code" placeholder="6-digit PIN"
          value={address.pincode} onChange={set('pincode')} icon={<MapPin className="h-4 w-4" />}
          inputMode="numeric" maxLength={6} />
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-1.5">
          State <span className="text-red-500">*</span>
        </label>
        <select id="state" value={address.state}
          onChange={set('state') as (e: React.ChangeEvent<HTMLSelectElement>) => void}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2E7D32] bg-white">
          <option value="">Select state</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <button onClick={onNext} disabled={!valid}
        className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 mt-2">
        Continue to Payment →
      </button>
    </div>
  );
};

// ── Payment Form ──────────────────────────────────────────────────────────────
const PaymentForm: React.FC<{
  method: string;
  onMethodChange: (m: string) => void;
  onBack: () => void;
  onPlace: () => void;
  loading: boolean;
  total: number;
  orderError?: string;
}> = ({ method, onMethodChange, onBack, onPlace, loading, total, orderError }) => {
  const options = [
    { id: 'COD',  label: 'Cash on Delivery',    sub: 'Pay when your order arrives', icon: Banknote,    iconColor: 'text-green-600',  iconBg: 'bg-green-100' },
    { id: 'UPI',  label: 'UPI / PhonePe / GPay', sub: 'Instant payment via UPI',    icon: Smartphone,  iconColor: 'text-blue-600',   iconBg: 'bg-blue-100' },
    { id: 'CARD', label: 'Credit / Debit Card',  sub: 'Visa, Mastercard, RuPay',    icon: CreditCard,  iconColor: 'text-purple-600', iconBg: 'bg-purple-100' },
    { id: 'NB',   label: 'Net Banking',          sub: 'All major banks supported',  icon: Building2,   iconColor: 'text-orange-600', iconBg: 'bg-orange-100' },
  ];
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {options.map(opt => (
          <button key={opt.id} onClick={() => onMethodChange(opt.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              method === opt.id ? 'border-[#2E7D32] bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}>
            <div className={`w-10 h-10 ${opt.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <opt.icon className={`h-5 w-5 ${opt.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${method === opt.id ? 'text-[#2E7D32]' : 'text-gray-800'}`}>{opt.label}</p>
              <p className="text-xs text-gray-500">{opt.sub}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${method === opt.id ? 'border-[#2E7D32]' : 'border-gray-300'}`}>
              {method === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />}
            </div>
          </button>
        ))}
      </div>
      {(method === 'UPI' || method === 'CARD' || method === 'NB') && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Online payment gateway coming soon. Order will be placed as <strong>Cash on Delivery</strong>.
          </p>
        </div>
      )}
      {orderError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Order Failed</p>
            <p className="text-xs text-red-600 mt-0.5">{orderError}</p>
          </div>
        </div>
      )}
      <div className="flex gap-3 pt-1">
        <button onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={onPlace} disabled={loading || !method}
          className="flex-1 flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-95">
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</>
            : <><Lock className="h-4 w-4" /> Complete Purchase · ₹{total}</>}
        </button>
      </div>
    </div>
  );
};

// ── Success Screen ────────────────────────────────────────────────────────────
const SuccessScreen: React.FC<{ orderId: string; total: number }> = ({ orderId, total }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5 animate-bounce">
        <CheckCircle className="h-10 w-10 text-[#2E7D32]" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        Order Placed!
      </h2>
      <p className="text-gray-500 text-sm mb-1">
        Order ID: <span className="font-mono font-semibold text-gray-700">#{orderId.slice(-8).toUpperCase()}</span>
      </p>
      <p className="text-gray-500 text-sm mb-6">Amount: <span className="font-bold text-[#2E7D32]">₹{total}</span></p>
      <p className="text-sm text-gray-500 max-w-xs mb-8">
        Your order is confirmed. The seller will dispatch it soon. Track it in My Orders.
      </p>
      <div className="flex gap-3">
        <button onClick={() => navigate('/farmer/orders')}
          className="px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white text-sm font-semibold hover:bg-green-800 transition-colors">
          Track Order
        </button>
        <button onClick={() => navigate('/farmer/store')}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

// ── Main CheckoutPage ─────────────────────────────────────────────────────────
export const CheckoutPage: React.FC = () => {
  const { cart, user, clearCart, removeFromCart } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const navState = location.state as { selectedIds?: string[]; buyNowIds?: string[] } | null;
  const filterIds: string[] | null = navState?.buyNowIds ?? navState?.selectedIds ?? null;
  const checkoutItems = filterIds ? cart.filter(i => filterIds.includes(i.product._id)) : cart;

  const [step, setStep] = useState<Step>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderError, setOrderError] = useState('');
  const [address, setAddress] = useState<Address>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    pincode: '', addressLine: '', city: '', state: '', landmark: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    if (checkoutItems.length === 0 && step !== 'success') {
      toast.error('Your cart is empty');
      navigate('/farmer/store');
    }
  }, []);

  const subtotal = checkoutItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const total = subtotal;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryStr = deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const handlePlaceOrder = async () => {
    setOrderError('');
    setLoading(true);
    try {
      const products = checkoutItems.map(i => ({ productId: i.product._id, quantity: i.quantity }));
      const deliveryAddress = {
        fullAddress: [address.addressLine, address.landmark, address.city, address.state].filter(Boolean).join(', '),
        village: address.addressLine,
        district: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
      };

      const { data } = await API.post('/orders', { products, deliveryAddress, paymentMethod: 'COD' });
      setOrderId(data.data._id);
      if (filterIds) {
        for (const id of filterIds) await removeFromCart(id);
      } else {
        clearCart();
      }
      setStep('success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to place order. Try again.';
      setOrderError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/cart" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Cart</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <img src="/krishakmart-logo.png" alt="KrishakMart" className="h-7 w-7" />
            <span className="font-bold text-gray-800 text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>KrishakMart</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Lock className="h-3.5 w-3.5 text-[#2E7D32]" />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Stepper */}
      {step !== 'success' && (
        <div className="bg-white border-b border-gray-100 py-4 px-4">
          <Stepper current={step} />
        </div>
      )}

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 py-6 pb-28 md:pb-8">
        {step === 'success' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-lg mx-auto">
            <SuccessScreen orderId={orderId} total={total} />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left: Form */}
            <div className="flex-1 w-full">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  {step === 'shipping'
                    ? <><Truck className="h-4 w-4 text-[#2E7D32]" /> Delivery Address</>
                    : <><CreditCard className="h-4 w-4 text-[#2E7D32]" /> Payment Method</>}
                </h2>
                {step === 'shipping' && (
                  <ShippingForm address={address} onChange={setAddress} onNext={() => setStep('payment')} />
                )}
                {step === 'payment' && (
                  <PaymentForm method={paymentMethod} onMethodChange={setPaymentMethod}
                    onBack={() => { setStep('shipping'); setOrderError(''); }} onPlace={handlePlaceOrder}
                    loading={loading} total={total} orderError={orderError} />
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-80 lg:sticky lg:top-24 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-4">
                  Order Summary ({checkoutItems.length} item{checkoutItems.length !== 1 ? 's' : ''})
                </h3>
                <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
                  {checkoutItems.map(item => (
                    <div key={item.product._id} className="flex items-center gap-3">
                      <img src={getFirstImage(item.product.images)} alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-800 flex-shrink-0">₹{item.product.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal}</span></div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span><span className="text-[#2E7D32] font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                    <span>Total</span><span>₹{total}</span>
                  </div>
                </div>
                <div className="mt-4 bg-green-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#2E7D32] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#2E7D32]">Expected by {deliveryStr}</p>
                    <p className="text-[10px] text-gray-500">Free delivery on this order</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                  {[
                    { icon: Shield, label: '100% Secure' },
                    { icon: Truck, label: 'Free Delivery' },
                    { icon: CheckCircle, label: 'Genuine' },
                  ].map(b => (
                    <div key={b.label} className="bg-gray-50 rounded-lg py-2 px-1">
                      <b.icon className="h-3.5 w-3.5 text-[#2E7D32] mx-auto mb-0.5" />
                      <p className="text-[9px] text-gray-500 font-medium">{b.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA */}
      {step === 'payment' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 md:hidden z-20 shadow-lg">
          <button onClick={handlePlaceOrder} disabled={loading || !paymentMethod}
            className="w-full flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-orange-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95">
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</>
              : <><Lock className="h-4 w-4" /> Complete Purchase · ₹{total}</>}
          </button>
        </div>
      )}
      {step === 'shipping' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 md:hidden z-20 shadow-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total</span>
            <span className="font-bold text-gray-900">₹{total}</span>
          </div>
        </div>
      )}
    </div>
  );
};
