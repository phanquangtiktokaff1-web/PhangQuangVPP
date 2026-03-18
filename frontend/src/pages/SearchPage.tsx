import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCard } from '@/components/product/ProductCard';
import { searchProducts } from '@/lib/mock-data';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');

  const results = useMemo(() => {
    let filtered = searchProducts(query);
    switch (sortBy) {
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'newest': filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'popular': filtered.sort((a, b) => b.sold - a.sold); break;
    }
    return filtered;
  }, [query, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6" />
            Kết quả tìm kiếm
          </h1>
          <p className="text-muted-foreground mt-1">
            {results.length} kết quả cho "{query}"
          </p>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Phổ biến nhất</SelectItem>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="price-asc">Giá thấp → cao</SelectItem>
            <SelectItem value="price-desc">Giá cao → thấp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
