import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Building2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { ProductCard } from '@/components/product/ProductCard';
import { catalogApi, type Product, type Category } from '@/lib/api-service';

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);

  useEffect(() => {
    catalogApi.getCategories().then(setCategories).catch(() => {});
    catalogApi.getProducts({ sort: 'popular', limit: 8 }).then(setBestSellers).catch(() => {});
    catalogApi.getProducts({ sort: 'discount', limit: 4 }).then(setDiscountedProducts).catch(() => {});
    catalogApi.getProducts({ sort: 'newest', limit: 4 }).then(setNewProducts).catch(() => {});
  }, []);


  return (
    <div>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#03045E] via-[#012A5B] to-[#011638] text-primary-foreground">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />

        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="mb-4 bg-white/15 text-white border border-white/30 backdrop-blur-sm">QuangVPP</Badge>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                Văn phòng phẩm cho
                <span className="block text-amber-300">học tập & công việc</span>
              </h1>
              <p className="text-base text-white/75 mb-7 max-w-md">
                Danh mục rõ ràng, dễ chọn. Phù hợp cho cá nhân, văn phòng và doanh nghiệp.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/category/but-viet">
                  <Button size="lg" className="bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg shadow-amber-500/20 font-semibold">
                    Mua ngay <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/wholesale">
                  <Button size="lg" variant="outline" className="!bg-transparent border-white/50 text-white hover:!bg-white/10 hover:text-white">
                    <Building2 className="h-4 w-4 mr-1.5 text-amber-300" /> Mua sỉ
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=900"
                  alt="Office supplies"
                  className="h-[340px] w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 pt-10 pb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Danh mục sản phẩm</h2>
          <Link to="/category/but-viet" className="text-primary text-sm hover:underline flex items-center gap-1">
            Tất cả <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug ?? cat.id}`}>
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 text-center group cursor-pointer">
                <CardContent className="p-3">
                  <div className="mb-2 flex justify-center text-primary group-hover:scale-110 transition-transform">
                    <IconRenderer name={cat.icon} className="h-8 w-8" />
                  </div>
                  <div className="text-xs font-medium group-hover:text-primary transition-colors leading-tight">{cat.name}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold">Bán chạy nhất</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sản phẩm được khách hàng tin dùng</p>
          </div>
          <Link to="/search?sort=popular" className="text-primary text-sm hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Discounted Products */}
      {discountedProducts.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Đang giảm giá</span>
              <Badge className="bg-rose-600 text-white text-xs">HOT</Badge>
            </div>
            <Link to="/search?sort=discount" className="text-primary text-sm hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {discountedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* New Products */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Mới nhất</span>
            <Badge variant="outline" className="text-primary border-primary text-xs">NEW</Badge>
          </div>
          <Link to="/search?sort=newest" className="text-primary text-sm hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {newProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 py-6 pb-12">
        <Card className="border-0 bg-gradient-to-r from-[#03045E] to-[#023E8A] text-white overflow-hidden relative">
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" />
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-amber-400/20 text-amber-300 border-amber-400/30 border">Dành cho doanh nghiệp</Badge>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-300" /> Mua hàng số lượng lớn?
                </h2>
                <p className="text-white/70 text-sm max-w-md">
                  Nhận báo giá ưu đãi theo số lượng, hỗ trợ in logo thương hiệu lên sản phẩm cho quà tặng và sự kiện.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link to="/wholesale">
                  <Button size="lg" className="bg-amber-400 text-amber-950 hover:bg-amber-300 font-semibold whitespace-nowrap">
                    Yêu cầu báo giá <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/customize">
                  <Button size="lg" variant="outline" className="!bg-transparent border-white/40 text-white hover:!bg-white/10 whitespace-nowrap gap-2">
                    <Sparkles className="h-4 w-4" /> In ấn & Tùy chỉnh
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
