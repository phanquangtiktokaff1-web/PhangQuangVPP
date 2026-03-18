import { Link } from 'react-router';
import { ArrowRight, Truck, Shield, Headphones, RotateCcw, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { ProductCard } from '@/components/product/ProductCard';
import { categories, products } from '@/lib/mock-data';

export function HomePage() {
  const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 8);
  const newProducts = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#03045E] via-[#012A5B] to-[#011638] text-primary-foreground">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-orange-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="mb-4 bg-white/15 text-white border border-white/30 backdrop-blur-sm">QuangVPP</Badge>

              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                Văn phòng phẩm cho
                <span className="block text-amber-300">học tập và công việc</span>
              </h1>

              <p className="text-base md:text-lg text-white/85 mb-7 max-w-xl">
                Danh mục sản phẩm rõ ràng, dễ chọn, phù hợp cho cá nhân, văn phòng và doanh nghiệp.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/category/but-viet">
                  <Button size="lg" className="bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-lg shadow-amber-500/20">
                    Mua ngay <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/wholesale">
                  <Button
                    size="lg"
                    variant="outline"
                    className="!bg-transparent border-white/60 text-white hover:!bg-white/15 hover:text-white backdrop-blur-sm"
                  >
                    <Building2 className="h-4 w-4 mr-1 text-amber-300" /> Mua sỉ
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="relative rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=900"
                  alt="Office supplies"
                  className="h-[360px] w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Giao hàng nhanh', desc: 'Theo khu vực và đơn hàng' },
              { icon: Shield, title: 'Sản phẩm rõ nguồn gốc', desc: 'Thông tin minh bạch' },
              { icon: RotateCcw, title: 'Hỗ trợ đổi trả', desc: 'Theo chính sách cửa hàng' },
              { icon: Headphones, title: 'Hỗ trợ khách hàng', desc: 'Giải đáp khi cần' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <feature.icon className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Danh mục sản phẩm</h2>
          <Link to="/category/but-viet" className="text-primary text-sm hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`}>
              <Card className="hover:shadow-md transition-shadow text-center group cursor-pointer">
                <CardContent className="p-4">
                  <div className="mb-3 flex justify-center text-primary group-hover:scale-110 transition-transform">
                    <IconRenderer name={cat.icon} className="h-10 w-10" />
                  </div>
                  <div className="text-sm font-medium group-hover:text-primary transition-colors">{cat.name}</div>
                  <div className="text-xs text-muted-foreground">{cat.productCount} sản phẩm</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm bán chạy</h2>
          <Link to="/search?sort=popular" className="text-primary text-sm hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Customization Banner */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-white/20 text-white border-0">Dịch vụ đặc biệt</Badge>
              <h2 className="text-3xl font-bold mb-4">Tùy chỉnh sản phẩm theo yêu cầu</h2>
              <p className="opacity-90 mb-6">
                In tên, logo công ty lên bút, sổ tay, cốc đựng bút. Phù hợp cho quà tặng doanh nghiệp, 
                sự kiện, hội nghị.
              </p>
              <Link to="/customize">
                <Button size="lg" variant="secondary">
                  Tìm hiểu thêm <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {products.filter(p => p.isCustomizable).slice(0, 3).map(p => (
                <div key={p.id} className="bg-white/10 rounded-lg p-3 text-center">
                  <img src={p.images[0]?.url} alt={p.name} className="w-full h-24 object-cover rounded mb-2" />
                  <div className="text-xs">{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm mới</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Wholesale Banner */}
      <section className="container mx-auto px-4 pb-10">
        <Card className="bg-gradient-to-r from-secondary to-background border-border">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 inline-flex items-center gap-2"><Building2 className="h-5 w-5" /> Mua hàng số lượng lớn?</h2>
              <p className="text-muted-foreground">
                Liên hệ để nhận báo giá phù hợp theo nhu cầu và số lượng thực tế của bạn.
              </p>
            </div>
            <Link to="/wholesale">
              <Button size="lg" className="bg-primary hover:bg-primary/90 whitespace-nowrap">
                Yêu cầu báo giá <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
