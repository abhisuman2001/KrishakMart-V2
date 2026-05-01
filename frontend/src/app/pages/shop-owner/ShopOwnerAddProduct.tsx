import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, IndianRupee, FileText, ImagePlus, Save, X, Tag, Layers, BookOpen, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { categories, createProduct } from '../../../services/productService';
import { toast } from 'sonner';

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 2;
const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ── ImageUploader component ───────────────────────────────────────────────────
interface ImageEntry { file: File; preview: string; }

const ImageUploader: React.FC<{
  images: ImageEntry[];
  onChange: (imgs: ImageEntry[]) => void;
}> = ({ images, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);

    // Validate each file
    const valid: File[] = [];
    for (const file of incoming) {
      if (!ACCEPTED.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG, WEBP allowed`); continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name}: exceeds ${MAX_SIZE_MB}MB limit`); continue;
      }
      valid.push(file);
    }

    const slots = MAX_IMAGES - images.length;
    if (slots <= 0) { toast.error(`You can only upload up to ${MAX_IMAGES} images`); return; }
    if (valid.length > slots) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images`);
    }
    const toAdd = valid.slice(0, slots);
    if (toAdd.length === 0) return;

    // Build previews
    const newEntries: ImageEntry[] = [];
    let loaded = 0;
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        newEntries.push({ file, preview: e.target?.result as string });
        loaded++;
        if (loaded === toAdd.length) {
          onChange([...images, ...newEntries]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images, onChange]);

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const slots = MAX_IMAGES - images.length;
  const filled = images.length;

  return (
    <div className="space-y-3">
      {/* Drop zone — hidden when full */}
      {filled < MAX_IMAGES && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-200
            ${dragging
              ? 'border-[#2E7D32] bg-green-50 scale-[1.01]'
              : 'border-gray-200 hover:border-[#2E7D32] hover:bg-green-50/50'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-[#2E7D32]' : 'bg-green-100'}`}>
            <Upload className={`h-5 w-5 ${dragging ? 'text-white' : 'text-[#2E7D32]'}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              {dragging ? 'Drop images here' : 'Click or drag & drop images'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              JPG, PNG, WEBP · max {MAX_SIZE_MB}MB each · {slots} slot{slots !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={e => { processFiles(e.target.files); e.target.value = ''; }}
          />
        </div>
      )}

      {/* Thumbnail grid — always 5 slots visible */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: MAX_IMAGES }).map((_, idx) => {
          const entry = images[idx];
          return entry ? (
            /* Filled slot */
            <div key={idx} className="relative group aspect-square">
              <img
                src={entry.preview}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover rounded-xl border-2 border-[#2E7D32]/30"
              />
              {/* Primary badge on first image */}
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#2E7D32] text-white px-1.5 py-0.5 rounded-md leading-none">
                  Cover
                </span>
              )}
              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {/* Checkmark overlay */}
              <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ) : (
            /* Empty slot */
            <button
              key={idx}
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-[#2E7D32]/50 hover:bg-green-50/50 flex items-center justify-center transition-all group"
            >
              <ImagePlus className="h-5 w-5 text-gray-300 group-hover:text-[#2E7D32]/50 transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {filled === 0
            ? 'No images selected — at least 1 required'
            : `${filled} / ${MAX_IMAGES} image${filled !== 1 ? 's' : ''} selected`}
        </p>
        {filled > 0 && (
          <div className="flex items-center gap-1 text-xs text-[#2E7D32] font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            First image is the cover photo
          </div>
        )}
      </div>
    </div>
  );
};

export const ShopOwnerAddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [product, setProduct] = useState({
    name: '', category: '', brand: '',
    price: '', stock: '', description: '', usage: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.name.trim()) { toast.error('Product name is required'); return; }
    if (!product.category) { toast.error('Please select a category'); return; }
    if (!product.brand.trim()) { toast.error('Brand is required'); return; }
    if (!product.price || parseFloat(product.price) <= 0) { toast.error('Enter a valid price'); return; }
    if (!product.stock || parseInt(product.stock) < 0) { toast.error('Enter a valid stock quantity'); return; }
    if (!product.description.trim()) { toast.error('Description is required'); return; }
    if (images.length === 0) { toast.error('Please upload at least 1 product image'); return; }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', product.name.trim());
      formData.append('category', product.category);
      formData.append('brand', product.brand.trim());
      formData.append('price', product.price);
      formData.append('stock', product.stock);
      formData.append('description', product.description.trim());
      formData.append('usage', product.usage.trim());
      images.forEach(img => formData.append('images', img.file));

      await createProduct(formData);
      toast.success('Product added successfully!');
      setProduct({ name: '', category: '', brand: '', price: '', stock: '', description: '', usage: '' });
      setImages([]);
      navigate('/shop-owner/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Add New Product</h1>
        <p className="text-gray-500 text-sm">List a new farming product for sale</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Product Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name *</Label>
            <div className="relative mt-1.5">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="name" placeholder="e.g., Wheat Seeds Premium Quality"
                value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500" required />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
            <div className="relative mt-1.5">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
              <Select value={product.category} onValueChange={(value) => setProduct({ ...product, category: value })}>
                <SelectTrigger className="pl-10 py-5 h-auto border-gray-200 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <cat.icon className={`h-4 w-4 ${cat.color}`} />
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Brand */}
          <div>
            <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand *</Label>
            <div className="relative mt-1.5">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="brand" placeholder="e.g., AgriGrow"
                value={product.brand} onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500" required />
            </div>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price (₹) *</Label>
              <div className="relative mt-1.5">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="price" type="number" min="0" step="0.01" placeholder="e.g., 850"
                  value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })}
                  className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500" required />
              </div>
            </div>
            <div>
              <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock Qty *</Label>
              <div className="relative mt-1.5">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="stock" type="number" min="0" placeholder="e.g., 150"
                  value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                  className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500" required />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description *</Label>
            <div className="relative mt-1.5">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea id="description" placeholder="Describe the product features, quality, and benefits..."
                value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })}
                className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500 min-h-[100px]" required />
            </div>
          </div>

          {/* Usage */}
          <div>
            <Label htmlFor="usage" className="text-sm font-medium text-gray-700">Usage Information</Label>
            <div className="relative mt-1.5">
              <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea id="usage" placeholder="e.g., Ideal for winter season. Sow 40-50 kg per acre."
                value={product.usage} onChange={(e) => setProduct({ ...product, usage: e.target.value })}
                className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500 min-h-[80px]" />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Product Images <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(1–5 images)</span>
            </Label>
            <div className="mt-2">
              <ImageUploader images={images} onChange={setImages} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/shop-owner/products')} disabled={loading}
              className="flex-1 py-5 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white py-5 font-semibold rounded-xl gap-2">
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
