import { Link } from 'react-router';
import { Heart, ShoppingCart, Eye, Star, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/lib/mock-data';
import { formatPrice } from '@/lib/mock-data';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { toast } from 'sonner';
import { CountdownTimer } from '@/components/product/CountdownTimer';

interface ProductCardProps {
  product: Product;
  showCompare?: boolean;
}

export function ProductCard({ product, showCompare = true }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem);
  const { addToWishlist, removeFromWishlist, isInWishlist, addToCompare, isInCompare } = useWishlistStore();

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const currentPrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product.id);
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.info('Đã xóa khỏi yêu thích');
    } else {
      addToWishlist(product.id);
      toast.success('Đã thêm vào yêu thích!');
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) {
      useWishlistStore.getState().removeFromCompare(product.id);
      toast.info('Đã xóa khỏi so sánh');
    } else {
      const success = addToCompare(product.id);
      if (success) {
        toast.success('Đã thêm vào so sánh!');
      } else {
        toast.error('Chỉ có thể so sánh tối đa 3 sản phẩm');
      }
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border">
      <Link to={`/product/${product.slug}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.images[0]?.url}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discount > 0 && (
              <Badge className="bg-red-500 text-white">-{product.discount}%</Badge>
            )}
            {product.isFlashSale && (
              <Badge className="bg-orange-500 text-white">⚡ Flash Sale</Badge>
            )}
            {product.isCustomizable && (
              <Badge variant="secondary">✨ Tùy chỉnh</Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant={inWishlist ? "default" : "secondary"}
              className="h-8 w-8"
              onClick={handleToggleWishlist}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
            </Button>
            {showCompare && (
              <Button
                size="icon"
                variant={inCompare ? "default" : "secondary"}
                className="h-8 w-8"
                onClick={handleToggleCompare}
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Flash sale countdown */}
          {product.isFlashSale && product.flashSaleEnd && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <CountdownTimer endTime={product.flashSaleEnd} />
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Hết hàng</span>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 text-foreground group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${star <= product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            <span className="text-xs text-muted-foreground ml-auto">Đã bán {product.sold}</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-red-600">{formatPrice(currentPrice)}</span>
            {currentPrice < product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {/* Add to cart button */}
          <Button
            className="w-full"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Thêm vào giỏ
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}
