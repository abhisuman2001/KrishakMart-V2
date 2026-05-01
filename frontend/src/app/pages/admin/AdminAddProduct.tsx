import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, IndianRupee, FileText, ImagePlus, Save, ArrowLeft, Tag, Layers, BookOpen, Info } from 'lucide-react';
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

export const AdminAddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: '', category: '', brand: '', price: '', stock: '', description: '', usage: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.name || !product.category || !product.brand || !product.price || !product.stock || !product.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('category', product.category);
      formData.append('brand', product.brand);
      formData.append('price', product.price);
      formData.append('stock', product.stock);
      formData.append('description', product.description);
      if (product.usage) formData.append('usage', product.usage);
      if (imageFile) formData.append('images', imageFile);
      await createProduct(formData);
      toast.success('Admin product added successfully!');
      navigate('/admin/my-products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-green-100 rounded-xl transition-colors text-green-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add Admin Product</h1>
          <p className="text-gray-500 text-sm mt-0.5">List a product directly from the platform administration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Notice */}
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
          <Info className="h-4 w-4 text-green-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 font-medium">
            This product will be listed with "Platform Official" as the seller.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-5">

          {/* Product Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name *</Label>
            <div className="relative mt-1.5">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                placeholder="e.g., Official Agri Hub Seed Kit"
                className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* Category + Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
              <div className="relative mt-1.5">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                <Select value={product.category} onValueChange={(v) => setProduct({ ...product, category: v })}>
                  <SelectTrigger className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500 h-auto">
                    <SelectValue placeholder="Select category" />
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

            <div>
              <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Official Brand Name *</Label>
              <div className="relative mt-1.5">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="brand"
                  value={product.brand}
                  onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                  placeholder="e.g., AgriHub Official"
                  className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">Selling Price (₹) *</Label>
              <div className="relative mt-1.5">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  value={product.price}
                  onChange={(e) => setProduct({ ...product, price: e.target.value })}
                  placeholder="e.g., 999"
                  className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Inventory Stock *</Label>
              <div className="relative mt-1.5">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="stock"
                  type="number"
                  value={product.stock}
                  onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                  placeholder="e.g., 500"
                  className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Detailed Description *</Label>
            <div className="relative mt-1.5">
              <FileText className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                placeholder="Provide a comprehensive description of the product..."
                className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500 min-h-[110px]"
                required
              />
            </div>
          </div>

          {/* Usage */}
          <div>
            <Label htmlFor="usage" className="text-sm font-medium text-gray-700">Usage Instructions (Optional)</Label>
            <div className="relative mt-1.5">
              <BookOpen className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Textarea
                id="usage"
                value={product.usage}
                onChange={(e) => setProduct({ ...product, usage: e.target.value })}
                placeholder="How to use this product..."
                className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500 min-h-[80px]"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Product Image</Label>
            <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="hidden" />
            <label
              htmlFor="image"
              className="mt-1.5 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-all duration-200 group"
            >
              {imagePreview ? (
                <div className="text-center space-y-2">
                  <img src={imagePreview} alt="Preview" className="h-28 w-28 object-cover rounded-xl mx-auto border border-gray-200" />
                  <p className="text-sm text-green-700 font-medium">Click to change image</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="bg-gray-100 group-hover:bg-green-100 p-3 rounded-xl inline-block transition-colors">
                    <ImagePlus className="h-6 w-6 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                </div>
              )}
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white py-5 font-semibold rounded-xl gap-2"
            disabled={loading}
          >
            <Save className="h-4 w-4" />
            {loading ? 'Publishing...' : 'Publish as Official Product'}
          </Button>

        </div>
      </form>
    </div>
  );
};
