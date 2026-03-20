import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router';
import { SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { ProductCard } from '@/components/product/ProductCard';
import { catalogApi, formatPrice, type Category, type Brand, type Product } from '@/lib/api-service';

export function CategoryPage() {
  const { slug } = useParams();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      catalogApi.getCategories(),
      catalogApi.getBrands(),
      catalogApi.getProducts(slug ? { categorySlug: slug } : {}),
    ]).then(([cats, brs, prods]) => {
      const found = cats.find(c => c.slug === slug) ?? null;
      setCategory(found);
      setBrands(brs);
      setProducts(prods);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const [sortBy, setSortBy] = useState('popular');
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 1000000]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => p.colors.forEach(c => colors.add(c)));
    return Array.from(colors);
  }, [products]);

  useEffect(() => {
    if (products.length === 0) {
      setPriceBounds([0, 1000000]);
      setPriceRange([0, 1000000]);
      return;
    }

    const prices = products.map(p => p.price).filter(v => Number.isFinite(v));
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    setPriceBounds([min, max]);
    setPriceRange([min, max]);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brandId));
    }

    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => p.colors.some(c => selectedColors.includes(c)));
    }

    const result = [...filtered];
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'popular': result.sort((a, b) => b.sold - a.sold); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [products, sortBy, priceRange, selectedBrands, selectedColors]);

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev => prev.includes(brandId) ? prev.filter(b => b !== brandId) : [...prev, brandId]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Khoảng giá</h3>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange([value[0] ?? priceBounds[0], value[1] ?? priceBounds[1]])}
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={1000}
          className="mb-3"
          disabled={priceBounds[0] === priceBounds[1]}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={priceBounds[0]}
            max={priceRange[1]}
            value={priceRange[0]}
            onChange={(e) => {
              const nextMin = Number(e.target.value);
              if (!Number.isFinite(nextMin)) return;
              setPriceRange([Math.max(priceBounds[0], Math.min(nextMin, priceRange[1])), priceRange[1]]);
            }}
          />
          <Input
            type="number"
            inputMode="numeric"
            min={priceRange[0]}
            max={priceBounds[1]}
            value={priceRange[1]}
            onChange={(e) => {
              const nextMax = Number(e.target.value);
              if (!Number.isFinite(nextMax)) return;
              setPriceRange([priceRange[0], Math.min(priceBounds[1], Math.max(nextMax, priceRange[0]))]);
            }}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Thương hiệu</h3>
        <div className="space-y-2">
          {brands.map(brand => (
            <div key={brand.id} className="flex items-center gap-2">
              <Checkbox id={brand.id} checked={selectedBrands.includes(brand.id)} onCheckedChange={() => toggleBrand(brand.id)} />
              <Label htmlFor={brand.id} className="text-sm font-normal cursor-pointer">{brand.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Màu sắc</h3>
        <div className="flex flex-wrap gap-2">
          {allColors.map(color => (
            <Badge key={color} variant={selectedColors.includes(color) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleColor(color)}>
              {color}
            </Badge>
          ))}
        </div>
      </div>

      {(selectedBrands.length > 0 || selectedColors.length > 0 || priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]) && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={() => { setSelectedBrands([]); setSelectedColors([]); setPriceRange([priceBounds[0], priceBounds[1]]); }}>
            Xóa bộ lọc
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          {category ? (
            <>
              <IconRenderer name={category.icon ?? ''} className="h-6 w-6 text-primary" />
              {category.name}
            </>
          ) : loading ? 'Đang tải...' : 'Tất cả sản phẩm'}
        </h1>
        {category?.description && <p className="text-muted-foreground">{category.description}</p>}
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" /> Bộ lọc
            </h2>
            <FilterSidebar />
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-1">
                    <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader><SheetTitle>Bộ lọc</SheetTitle></SheetHeader>
                  <div className="mt-4"><FilterSidebar /></div>
                </SheetContent>
              </Sheet>
              <span className="text-sm text-muted-foreground">{filteredProducts.length} sản phẩm</span>
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Sắp xếp" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Phổ biến nhất</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price-asc">Giá thấp → cao</SelectItem>
                  <SelectItem value="price-desc">Giá cao → thấp</SelectItem>
                  <SelectItem value="rating">Đánh giá cao</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden sm:flex border rounded-md">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setViewMode('grid')}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setViewMode('list')}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {(selectedBrands.length > 0 || selectedColors.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedBrands.map(id => {
                const brand = brands.find(b => b.id === id);
                return brand ? (
                  <Badge key={id} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleBrand(id)}>
                    {brand.name} ✕
                  </Badge>
                ) : null;
              })}
              {selectedColors.map(color => (
                <Badge key={color} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleColor(color)}>
                  {color} ✕
                </Badge>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">{loading ? 'Đang tải sản phẩm...' : 'Không tìm thấy sản phẩm nào'}</p>
              {!loading && <p className="text-sm text-muted-foreground mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-4'}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
