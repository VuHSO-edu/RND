import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Sparkles, Filter, Check, Eye } from 'lucide-react';
import { fetchProducts, Product } from '../../../services/heritageApi';
import { useCartStore } from '../../../stores/useCartStore';
import { Button } from '../../../components/ui/Button';
import { ProductDetailPage } from './ProductDetailPage';

interface ProductCatalogPageProps {
  onSelectProductForPassport?: (code: string) => void;
}

export const ProductCatalogPage: React.FC<ProductCatalogPageProps> = ({ onSelectProductForPassport }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  const categories = [
    { id: undefined, name: 'Tất Cả Tác Phẩm' },
    { id: 1, name: '🏺 Gốm Sứ Men Cổ' },
    { id: 2, name: '🧣 Lụa & Thêu Ren' },
    { id: 3, name: '🪵 Điêu Khắc Gỗ Trầm' },
    { id: 4, name: '🪙 Kim Hoàn & Đúc Đồng' },
  ];

  useEffect(() => {
    setLoading(true);
    fetchProducts(selectedCategory)
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  // Nếu người dùng chọn xem chi tiết một tác phẩm
  if (selectedProduct) {
    return (
      <ProductDetailPage
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onOpenPassport={onSelectProductForPassport}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Catalog Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-heritage-terracotta font-semibold">Bộ Sưu Tập Tác Phẩm Thủ Công</span>
        <h1 className="text-3xl md:text-4xl font-heritage font-bold text-heritage-indigo">
          {t('nav.catalog')}
        </h1>
        <p className="text-sm text-gray-600 font-sans">
          Mỗi tác phẩm đều mang một Hộ chiếu Di sản Số bảo chứng nguồn gốc và video ký sự chế tác từ nghệ nhân.
        </p>
      </div>

      {/* Cultural Categories Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={String(cat.id)}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-heritage-indigo text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-heritage-terracotta mx-auto"></div>
          <p className="mt-4 text-xs text-gray-500">Đang tải các tác phẩm di sản...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-heritage-indigo/10 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Image Preview */}
              <div 
                onClick={() => setSelectedProduct(product)}
                className="relative h-64 w-full bg-stone-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.isUniqueArtwork && (
                  <span className="absolute top-3 left-3 bg-heritage-terracotta text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    Độc Bản (1 of 1)
                  </span>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Có Passport Số
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold">
                    {product.artisan?.craftVillage?.name || 'Làng Nghề Truyền Thống'}
                  </span>
                  <h3 
                    onClick={() => setSelectedProduct(product)}
                    className="font-heritage font-bold text-lg text-heritage-indigo group-hover:text-heritage-terracotta transition-colors mt-1 cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Nghệ nhân: <strong className="text-gray-700">{product.artisan?.user?.fullName || 'Nghệ Nhân Làng Nghề'}</strong> {product.artisan?.title ? `(${product.artisan.title})` : ''}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 block">Giá tác phẩm:</span>
                    <span className="text-lg font-bold font-sans text-heritage-terracotta">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                      title="Xem chi tiết tác phẩm & 3D"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="heritage"
                      size="sm"
                      onClick={() => addToCart(product)}
                      className="gap-1.5"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Đặt Mua
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
