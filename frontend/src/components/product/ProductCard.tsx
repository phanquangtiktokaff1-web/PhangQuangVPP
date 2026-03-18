import { Link } from 'react-router';
import { Heart, ShoppingCart, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type Product, formatPrice } from '@/lib/api-service';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  showCompare?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ProductCard({ product, showCompare: _sc = true }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(product.id);
  const currentPrice = product.price;

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
              <Badge className="bg-rose-600 text-white">-{product.discount}%</Badge>
            )}
            {product.isCustomizable && (
              <Badge className="bg-violet-100 text-violet-700 gap-1"><Sparkles className="h-3 w-3" /> Tùy chỉnh</Badge>
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
          </div>

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
                  className={`h-3 w-3 ${star <= product.rating ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            <span className="text-xs text-muted-foreground ml-auto">Đã bán {product.sold}</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-rose-600">{formatPrice(currentPrice)}</span>
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
