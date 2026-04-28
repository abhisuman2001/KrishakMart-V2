import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { getFirstImage } from '../../utils/imageUtils';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity } = useApp();
  const navigate = useNavigate();

  // Track which items are selected (default: all selected)
  const [selected, setSelected] = useState<Set<string>>(() =>
    new Set(cart.map(i => i.product._id))
  );

  const allSelected = cart.length > 0 && selected.size === cart.length;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(cart.map(i => i.product._id)));
  };

  const toggleItem = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedItems = cart.filter(i => selected.has(i.product._id));
  const selectedTotal = selectedItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totalAmount = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const handleCheckout = () => {
    if (selected.size === 0) { toast.error('Select at least one item to checkout'); return; }
    navigate('/checkout', { state: { selectedIds: [...selected] } });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
        <ShoppingBag className="h-20 w-20 text-gray-200 mb-5" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-6">Add some farming supplies to get started</p>
        <Link to="/farmer/store"
          className="flex items-center gap-2 bg-[#2E7D32] hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          <ShoppingCart className="h-4 w-4" /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 lg:pb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <h1 className="text-2xl font-bold text-gray-900 mb-5" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        My Cart <span className="text-base font-normal text-gray-400">({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left: Items ── */}
        <div className="flex-1 w-full space-y-3">

          {/* Select all row */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex items-center gap-3">
            <input
              type="checkbox"
              id="select-all"
              checked={allSelected}
              onChange={toggleAll}
              className="w-4 h-4 accent-[#2E7D32] cursor-pointer"
            />
            <label htmlFor="select-all" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
              Select All ({cart.length} items)
            </label>
            {selected.size > 0 && selected.size < cart.length && (
              <span className="ml-auto text-xs text-gray-400">{selected.size} of {cart.length} selected</span>
            )}
          </div>

          {/* Cart items */}
          {cart.map(item => {
            const id = item.product._id;
            const isChecked = selected.has(id);
            return (
              <div key={id}
                className={`bg-white rounded-2xl border shadow-sm transition-all duration-150 ${
                  isChecked ? 'border-[#2E7D32]/40' : 'border-gray-100 opacity-60'
                }`}>
                <div className="flex items-start gap-4 p-4">

                  {/* Checkbox */}
                  <div className="pt-1 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(id)}
                      className="w-4 h-4 accent-[#2E7D32] cursor-pointer"
                    />
                  </div>

                  {/* Image */}
                  <img
                    src={getFirstImage(item.product.images)}
                    alt={item.product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#2E7D32] mb-0.5">{item.product.brand}</p>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-snug line-clamp-2 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-lg font-extrabold text-gray-900">₹{item.product.price}</p>
                    <p className="text-xs text-gray-400">Subtotal: ₹{item.product.price * item.quantity}</p>
                  </div>

                  {/* Qty + Delete */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    {/* Delete */}
                    <button
                      onClick={() => { removeFromCart(id); setSelected(p => { const n = new Set(p); n.delete(id); return n; }); }}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Qty stepper */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateCartQuantity(id, item.quantity - 1)}
                        className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-bold border-x border-gray-200 min-w-[36px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(id, item.quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Right: Summary ── */}
        <div className="w-full lg:w-72 lg:sticky lg:top-6 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-900 text-base">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Cart total ({cart.length} items)</span>
                <span>₹{totalAmount}</span>
              </div>
              {selected.size > 0 && selected.size < cart.length && (
                <div className="flex justify-between text-[#2E7D32] font-semibold">
                  <span>Selected ({selected.size} items)</span>
                  <span>₹{selectedTotal}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span className="text-[#2E7D32] font-semibold">FREE</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>To Pay</span>
                <span>₹{selected.size > 0 ? selectedTotal : totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={selected.size === 0}
              className="w-full flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all active:scale-95"
            >
              Proceed ({selected.size > 0 ? selected.size : 0} item{selected.size !== 1 ? 's' : ''})
              <ArrowRight className="h-4 w-4" />
            </button>

            {selected.size === 0 && (
              <p className="text-xs text-center text-gray-400">Select items above to proceed</p>
            )}

            <div className="bg-green-50 rounded-xl px-3 py-2.5 text-xs text-gray-600 text-center space-y-0.5">
              <p>✓ 100% Genuine Products</p>
              <p>✓ Free Delivery</p>
              <p>✓ Cash on Delivery Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 lg:hidden z-20 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">{selected.size} item{selected.size !== 1 ? 's' : ''} selected</p>
            <p className="font-bold text-gray-900">₹{selectedTotal}</p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={selected.size === 0}
            className="flex items-center gap-2 bg-[#FF9800] hover:bg-orange-500 disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95"
          >
            Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
