import React, { useState, useRef } from 'react';
import {
  User, Phone, Mail, MapPin, Save, Calendar,
  BadgeCheck, Camera, Lock, Loader2, Store, FileText, Hash,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import API from '../../../services/api';
import { LocationPicker, LocationData } from '../../components/LocationPicker';

const BACKEND = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const avatarUrl = (src?: string) => {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  return `${BACKEND}${src}`;
};

export const ShopOwnerProfile: React.FC = () => {
  const { user, setUser } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    shopName: user?.shopName || '',
    shopAddress: user?.shopAddress || '',
    shopDescription: user?.shopDescription || '',
    gstNumber: user?.gstNumber || '',
    shopLocation: (user as any)?.shopLocation as LocationData | undefined,
  });

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : 'N/A';

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const { data } = await API.post('/users/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = { ...user!, ...data.data };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile photo updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // ── Profile save ───────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.shopName.trim()) { toast.error('Shop name is required'); return; }
    setSaving(true);
    try {
      const { data } = await API.put('/users/profile', {
        name: profile.name,
        email: profile.email || undefined,
        shopName: profile.shopName,
        shopAddress: profile.shopAddress || undefined,
        shopDescription: profile.shopDescription || undefined,
        gstNumber: profile.gstNumber || undefined,
        shopLocation: profile.shopLocation?.latitude ? profile.shopLocation : undefined,
      });
      const updated = { ...user!, ...data.data };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar = avatarPreview || avatarUrl((user as any)?.avatar);
  const initials = (user?.shopName || user?.name)?.charAt(0).toUpperCase() || 'S';

  return (
    <div className="space-y-6 max-w-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>

      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          My Profile
        </h1>
        <p className="text-gray-500 text-sm">Manage your shop and account information</p>
      </div>

      {/* ── Summary Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-orange-100 flex items-center justify-center">
              {currentAvatar ? (
                <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-[#FF9800]">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#FF9800] border-2 border-white flex items-center justify-center shadow hover:bg-orange-500 transition-colors disabled:opacity-60"
              title="Change photo"
            >
              {uploadingAvatar
                ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                : <Camera className="h-3.5 w-3.5 text-white" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-gray-900 truncate">{user?.shopName || user?.name}</p>
            <p className="text-sm text-gray-500 truncate">{user?.name}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-100 text-[#FF9800] px-2.5 py-0.5 rounded-full mt-1">
              <Store className="h-3 w-3" /> Shop Owner
            </span>
            {uploadingAvatar && <p className="text-xs text-gray-400 mt-1">Uploading photo...</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-gray-50 rounded-xl px-3 py-3 text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">Role</p>
            <p className="text-xs font-bold text-gray-700">Shop Owner</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Calendar className="h-3 w-3 text-gray-400" />
              <p className="text-[10px] text-gray-400">Member Since</p>
            </div>
            <p className="text-xs font-bold text-gray-700">{memberSince}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <BadgeCheck className="h-3 w-3 text-gray-400" />
              <p className="text-[10px] text-gray-400">Status</p>
            </div>
            <p className="text-xs font-bold text-[#2E7D32]">Active</p>
          </div>
        </div>
      </div>

      {/* ── Edit Form ── */}
      <form onSubmit={handleSave} className="space-y-4">

        {/* Group A: Identity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Identity</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField id="name" label="Owner Name" placeholder="Your full name"
              value={profile.name} icon={<User className="h-4 w-4" />}
              onChange={v => setProfile(p => ({ ...p, name: v }))} />
            <InputField id="email" label="Email Address" placeholder="email@example.com (optional)"
              value={profile.email} icon={<Mail className="h-4 w-4" />}
              onChange={v => setProfile(p => ({ ...p, email: v }))} type="email" />
          </div>
          {/* Locked phone */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input value={user?.phone || ''} disabled
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Phone is your primary account key and cannot be changed.</p>
          </div>
        </div>

        {/* Group B: Business */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Business</p>
          <div className="space-y-4">
            <InputField id="shopName" label="Shop Name" placeholder="Your shop or business name"
              value={profile.shopName} icon={<Store className="h-4 w-4" />}
              onChange={v => setProfile(p => ({ ...p, shopName: v }))} />
            <InputField id="gstNumber" label="GST / License Number" placeholder="Optional — add later"
              value={profile.gstNumber} icon={<Hash className="h-4 w-4" />}
              onChange={v => setProfile(p => ({ ...p, gstNumber: v }))} />
            <TextareaField id="shopDescription" label="Shop Description"
              placeholder="Describe your shop and the products you sell..."
              value={profile.shopDescription} icon={<FileText className="h-4 w-4" />}
              onChange={v => setProfile(p => ({ ...p, shopDescription: v }))} />
          </div>
        </div>

        {/* Group C: Location */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Location</p>
          <div className="space-y-4">
            <TextareaField id="shopAddress" label="Shop Address" placeholder="Full shop address"
              value={profile.shopAddress} icon={<MapPin className="h-4 w-4" />}
              onChange={v => setProfile(p => ({ ...p, shopAddress: v }))} />
            <LocationPicker
              label="Pin Shop Location on Map"
              placeholder="Open map to pin your exact shop location"
              value={profile.shopLocation}
              onChange={loc => setProfile(p => ({ ...p, shopLocation: loc }))}
            />
            {profile.shopLocation && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                {profile.shopLocation.city && (
                  <div className="bg-orange-50 rounded-lg px-3 py-2">
                    <p className="text-gray-400 text-[10px]">City</p>
                    <p className="font-semibold text-gray-700 truncate">{profile.shopLocation.city}</p>
                  </div>
                )}
                {profile.shopLocation.state && (
                  <div className="bg-orange-50 rounded-lg px-3 py-2">
                    <p className="text-gray-400 text-[10px]">State</p>
                    <p className="font-semibold text-gray-700 truncate">{profile.shopLocation.state}</p>
                  </div>
                )}
                {profile.shopLocation.pincode && (
                  <div className="bg-orange-50 rounded-lg px-3 py-2">
                    <p className="text-gray-400 text-[10px]">PIN</p>
                    <p className="font-semibold text-gray-700">{profile.shopLocation.pincode}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save */}
        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95">
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>
      </form>
    </div>
  );
};

// ── Reusable input field ───────────────────────────────────────────────────────
const InputField: React.FC<{
  id: string; label: string; placeholder: string;
  value: string; icon: React.ReactNode;
  onChange: (v: string) => void; type?: string;
}> = ({ id, label, placeholder, value, icon, onChange, type = 'text' }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</span>
      <input id={id} type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF9800] focus:ring-1 focus:ring-orange-200 transition-colors bg-white" />
    </div>
  </div>
);

// ── Reusable textarea field ────────────────────────────────────────────────────
const TextareaField: React.FC<{
  id: string; label: string; placeholder: string;
  value: string; icon: React.ReactNode;
  onChange: (v: string) => void;
}> = ({ id, label, placeholder, value, icon, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-3 text-gray-400 pointer-events-none">{icon}</span>
      <textarea id={id} value={value} placeholder={placeholder} rows={3}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF9800] focus:ring-1 focus:ring-orange-200 transition-colors bg-white resize-none" />
    </div>
  </div>
);
