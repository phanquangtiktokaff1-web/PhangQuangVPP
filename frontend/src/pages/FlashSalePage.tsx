import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/ProductCard';
import { CountdownTimer } from '@/components/product/CountdownTimer';
import { catalogApi, type Product } from '@/lib/api-service';

export function FlashSalePage() {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [fallbackEnd] = useState(() => new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString());
  useEffect(() => { catalogApi.getProducts({ isFlashSale: true }).then(setFlashSaleProducts).catch(() => {}); }, []);
  const nextEndTime = flashSaleProducts[0]?.flashSaleEnd ?? fallbackEnd;


  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-white/20 text-white border-0 mb-4 text-lg px-4 py-1">
            <Zap className="h-5 w-5 mr-1" /> FLASH SALE
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Giảm giá sốc - Số lượng có hạn!</h1>
          <p className="text-lg opacity-90 mb-6">Nhanh tay mua ngay trước khi hết hàng</p>
          <div className="flex justify-center">
            <CountdownTimer endTime={nextEndTime} variant="large" />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {flashSaleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {flashSaleProducts.length === 0 && (
          <div className="text-center py-16">
            <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Chưa có Flash Sale</h2>
            <p className="text-muted-foreground">Hãy quay lại sau để xem các chương trình khuyến mãi mới</p>
          </div>
        )}
      </section>
    </div>
  );
}
