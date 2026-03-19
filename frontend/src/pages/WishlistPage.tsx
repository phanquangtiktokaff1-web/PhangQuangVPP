import { Link } from 'react-router';
import { Heart, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { useWishlistStore } from '@/store/wishlist-store';

export function WishlistPage() {
  const { products: wishlistProducts } = useWishlistStore();

  if (wishlistProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Danh sách yêu thích trống</h1>
        <p className="text-muted-foreground mb-6">Hãy thêm sản phẩm yêu thích để theo dõi</p>
        <Link to="/"><Button size="lg">Khám phá sản phẩm</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" /> Sản phẩm yêu thích ({wishlistProducts.length})
        </h1>
        <Link to="/compare">
          <Button variant="outline" className="gap-2">
            <BarChart2 className="h-4 w-4" /> So sánh sản phẩm
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {wishlistProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
