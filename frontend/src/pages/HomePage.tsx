import { Link } from 'react-router';
import { ArrowRight, Truck, Shield, Headphones, RotateCcw, Zap, BadgePercent, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { ProductCard } from '@/components/product/ProductCard';
import { CountdownTimer } from '@/components/product/CountdownTimer';
import { categories, products, getFlashSaleProducts } from '@/lib/mock-data';

export function HomePage() {
  const flashSaleProducts = getFlashSaleProducts();
  const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 8);
  const newProducts = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-white/20 text-white border-0 gap-1"><BadgePercent className="h-3 w-3" /> Giảm đến 50%</Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Văn phòng phẩm<br />chất lượng cao
              </h1>
              <p className="text-lg opacity-90 mb-6">
                Cung cấp đầy đủ dụng cụ văn phòng, bút viết, giấy in, phụ kiện bàn làm việc 
                với giá tốt nhất thị trường.
              </p>
              <div className="flex gap-3">
                <Link to="/category/but-viet">
                  <Button size="lg" variant="secondary">
                    Mua ngay <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/flash-sale">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Zap className="h-4 w-4 mr-1" /> Flash Sale
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600"
                alt="Office supplies"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Miễn phí vận chuyển', desc: 'Đơn từ 500.000đ' },
              { icon: Shield, title: 'Hàng chính hãng', desc: '100% cam kết' },
              { icon: RotateCcw, title: 'Đổi trả dễ dàng', desc: 'Trong 7 ngày' },
              { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Tư vấn miễn phí' },
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

      {/* Flash Sale */}
      {flashSaleProducts.length > 0 && (
        <section className="bg-gradient-to-r from-red-50 to-orange-50 py-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="h-6 w-6 text-orange-500" />
                  Flash Sale
                </h2>
                {flashSaleProducts[0]?.flashSaleEnd && (
                  <CountdownTimer endTime={flashSaleProducts[0].flashSaleEnd} variant="default" />
                )}
              </div>
              <Link to="/flash-sale" className="text-red-600 text-sm hover:underline flex items-center gap-1">
                Xem tất cả <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashSaleProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

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
              <Badge className="mb-4 bg-white/20 text-white border-0 gap-1"><Zap className="h-3 w-3" /> Dịch vụ đặc biệt</Badge>
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
                Nhận báo giá đặc biệt cho đơn hàng từ 50 sản phẩm trở lên. 
                Giảm đến 40% so với giá lẻ!
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
