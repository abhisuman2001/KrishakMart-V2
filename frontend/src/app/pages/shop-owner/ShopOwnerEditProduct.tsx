import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, IndianRupee, FileText, ImagePlus, Save, X, Upload, ArrowLeft, Tag, Layers, BookOpen } from 'lucide-react';
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
import { categories, getProduct, updateProduct } from '../../../services/productService';
import { toast } from 'sonner';
import { getImageUrl } from '../../../utils/imageUtils';

interface EditProductProps {
  returnPath?: string;
}

export const ShopOwnerEditProduct: React.FC<EditProductProps> = ({ returnPath = '/shop-owner/products' }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [product, setProduct] = useState({
    name: '', category: '', brand: '', price: '', stock: '', description: '', usage: '',
  });

  useEffect(() => {
    if (id) fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      setFetchingProduct(true);
      const data = await getProduct(id!);
      setProduct({
        name: data.name,
        category: data.category,
        brand: data.brand,
        price: data.price.toString(),
        stock: data.stock.toString(),
        description: data.description,
        usage: data.usage || '',
      });
      if (data.images?.length > 0) setExistingImages(data.images);
    } catch (error) {
      toast.error('Failed to load product details');
      navigate(returnPath);
    } finally {
      setFetchingProduct(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image`); return false; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} exceeds 5MB`); return false; }
      return true;
    });
    if (existingImages.length + selectedImages.length + validFiles.length > 5) {
      toast.error('Maximum 5 images allowed'); return;
    }
    const newImages = [...selectedImages, ...validFiles];
    setSelectedImages(newImages);
    const newPreviews = [...imagePreviews];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => { newPreviews.push(e.target?.result as string); setImagePreviews([...newPreviews]); };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.name.trim()) { toast.error('Product name is required'); return; }
    if (!product.category) { toast.error('Please select a category'); return; }
    if (!product.brand.trim()) { toast.error('Brand is required'); return; }
    if (!product.price || parseFloat(product.price) <= 0) { toast.error('Enter a valid price'); return; }
    if (!product.stock || parseInt(product.stock) < 0) { toast.error('Enter a valid stock quantity'); return; }
    if (!product.description.trim()) { toast.error('Description is required'); return; }

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
      existingImages.forEach(img => formData.append('existingImages', img));
      selectedImages.forEach(img => formData.append('images', img));
      await updateProduct(id!, formData);
      toast.success('Product updated successfully!');
      navigate(returnPath);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(returnPath)}
          className="p-2 hover:bg-green-100 rounded-xl transition-colors text-green-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
          <p className="text-gray-500 text-sm mt-0.5">Update your product details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
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
                placeholder="e.g., Wheat Seeds Premium Quality"
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
              <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand *</Label>
              <div className="relative mt-1.5">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="brand"
                  value={product.brand}
                  onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                  placeholder="e.g., AgriGrow"
                  className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price (₹) *</Label>
              <div className="relative mt-1.5">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.price}
                  onChange={(e) => setProduct({ ...product, price: e.target.value })}
                  placeholder="e.g., 850"
                  className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock Quantity *</Label>
              <div className="relative mt-1.5">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={product.stock}
                  onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                  placeholder="e.g., 150"
                  className="pl-10 py-5 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Product Description *</Label>
            <div className="relative mt-1.5">
              <FileText className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                placeholder="Describe the product features, quality, and benefits..."
                className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500 min-h-[110px]"
                required
              />
            </div>
          </div>

          {/* Usage */}
          <div>
            <Label htmlFor="usage" className="text-sm font-medium text-gray-700">Usage Information (Optional)</Label>
            <div className="relative mt-1.5">
              <BookOpen className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Textarea
                id="usage"
                value={product.usage}
                onChange={(e) => setProduct({ ...product, usage: e.target.value })}
                placeholder="e.g., Ideal for winter season. Sow 40-50 kg per acre."
                className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500 min-h-[80px]"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Product Images (Max 5)</Label>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">Current images ({existingImages.length})</p>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={getImageUrl(img)} alt={`img-${i}`} className="h-20 w-20 object-cover rounded-xl border border-gray-200" />
                      <button type="button" onClick={() => removeExistingImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">New images ({imagePreviews.length})</p>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative group">
                      <img src={preview} alt={`new-${i}`} className="h-20 w-20 object-cover rounded-xl border border-green-200" />
                      <button type="button" onClick={() => removeNewImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload area */}
            {(existingImages.length + selectedImages.length) < 5 && (
              <div className="mt-3">
                <input type="file" id="images" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                <label htmlFor="images"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-all duration-200 group">
                  <div className="bg-gray-100 group-hover:bg-green-100 p-3 rounded-xl inline-block transition-colors mb-2">
                    <ImagePlus className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Click to upload images</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB each</p>
                </label>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(returnPath)}
              className="flex-1 py-5 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-700 hover:bg-green-800 text-white py-5 font-semibold rounded-xl gap-2"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
};
