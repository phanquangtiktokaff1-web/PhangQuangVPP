import { Link } from 'react-router';
import { BarChart2, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/api-service';
import { toast } from 'sonner';

export function ComparePage() {
  const { products: wishlistProducts } = useWishlistStore();
  const addItem = useCartStore(s => s.addItem);
  // Compare up to 3 wishlist items
  const compareProducts = wishlistProducts.slice(0, 3);

  if (compareProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <BarChart2 className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Chưa có sản phẩm để so sánh</h1>
        <p className="text-muted-foreground mb-6">Thêm sản phẩm vào danh sách yêu thích để so sánh</p>
        <Link to="/"><Button size="lg">Khám phá sản phẩm</Button></Link>
      </div>
    );
  }

  // Collect all specification keys
  const allSpecKeys = new Set<string>();
  compareProducts.forEach(p => Object.keys(p.specifications || {}).forEach(k => allSpecKeys.add(k)));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="h-6 w-6" /> So sánh sản phẩm ({compareProducts.length}/3)
        </h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left p-3 w-40 bg-gray-50 font-semibold">Sản phẩm</th>
              {compareProducts.map(product => (
                <th key={product.id} className="p-3 text-center bg-gray-50">
                  <Link to={`/product/${product.slug}`}>
                    <img src={product.images[0]?.url} alt={product.name} className="w-32 h-32 object-cover rounded-lg mx-auto mb-2" />
                    <div className="font-medium text-sm hover:text-primary">{product.name}</div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price */}
            <tr className="border-t">
              <td className="p-3 font-medium text-muted-foreground">Giá</td>
              {compareProducts.map(p => (
                <td key={p.id} className="p-3 text-center">
                  <span className="font-bold text-red-600">{formatPrice(p.price)}</span>
                  {p.originalPrice > p.price && (
                    <div className="text-xs text-muted-foreground line-through">{formatPrice(p.originalPrice)}</div>
                  )}
                </td>
              ))}
            </tr>

            {/* Brand */}
            <tr className="border-t bg-gray-50/50">
              <td className="p-3 font-medium text-muted-foreground">Thương hiệu</td>
              {compareProducts.map(p => (
                <td key={p.id} className="p-3 text-center">{p.brandId}</td>
              ))}
            </tr>

            {/* Rating */}
            <tr className="border-t">
              <td className="p-3 font-medium text-muted-foreground">Đánh giá</td>
              {compareProducts.map(p => (
                <td key={p.id} className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{p.rating}</span>
                    <span className="text-xs text-muted-foreground">({p.reviewCount})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Stock */}
            <tr className="border-t bg-gray-50/50">
              <td className="p-3 font-medium text-muted-foreground">Tồn kho</td>
              {compareProducts.map(p => (
                <td key={p.id} className="p-3 text-center">
                  <Badge variant={p.stock > 100 ? 'default' : p.stock > 0 ? 'secondary' : 'destructive'}>
                    {p.stock > 0 ? `${p.stock} sản phẩm` : 'Hết hàng'}
                  </Badge>
                </td>
              ))}
            </tr>

            {/* Colors */}
            <tr className="border-t">
              <td className="p-3 font-medium text-muted-foreground">Màu sắc</td>
              {compareProducts.map(p => (
                <td key={p.id} className="p-3 text-center">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {(p.colors || []).map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                  </div>
                </td>
              ))}
            </tr>

            {/* Specifications */}
            {Array.from(allSpecKeys).map((key, i) => (
              <tr key={key} className={`border-t ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                <td className="p-3 font-medium text-muted-foreground">{key}</td>
                {compareProducts.map(p => (
                  <td key={p.id} className="p-3 text-center text-sm">
                    {(p.specifications || {})[key] || '-'}
                  </td>
                ))}
              </tr>
            ))}

            {/* Add to cart */}
            <tr className="border-t">
              <td className="p-3"></td>
              {compareProducts.map(p => (
                <td key={p.id} className="p-3 text-center">
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => { void addItem(p.id); toast.success('Đã thêm vào giỏ hàng!'); }}
                    disabled={p.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
