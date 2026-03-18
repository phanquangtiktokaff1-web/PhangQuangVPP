import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, RotateCcw, Share2, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { CountdownTimer } from '@/components/product/CountdownTimer';
import { ProductCard } from '@/components/product/ProductCard';
import { products, getBrandById, getCategoryById, formatPrice } from '@/lib/mock-data';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export function ProductDetailPage() {
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [customType, setCustomType] = useState('');
  const [customText, setCustomText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const addItem = useCartStore(s => s.addItem);
  const { addToWishlist, removeFromWishlist, isInWishlist, addToCompare } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h1>
        <Link to="/"><Button>Về trang chủ</Button></Link>
      </div>
    );
  }

  const brand = getBrandById(product.brandId);
  const category = getCategoryById(product.categoryId);
  const inWishlist = isInWishlist(product.id);
  const currentPrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
  const relatedProducts = products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    const customization = customType && customText ? { type: customType, text: customText } : undefined;
    addItem(product.id, quantity, customization);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/cart';
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: product.reviews.filter(r => r.rating === star).length,
    percentage: product.reviews.length > 0
      ? (product.reviews.filter(r => r.rating === star).length / product.reviews.length) * 100
      : 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>/</span>
        {category && (
          <>
            <Link to={`/category/${category.slug}`} className="hover:text-primary">{category.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Product Info */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="border rounded-lg overflow-hidden mb-4">
            <img
              src={product.images[selectedImage]?.url}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                className={`border-2 rounded-md overflow-hidden w-20 h-20 ${
                  i === selectedImage ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {brand && <Badge variant="outline">{brand.name}</Badge>}
            <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
          </div>

          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`h-4 w-4 ${star <= product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
              <span className="text-sm font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">{product.reviewCount} đánh giá</span>
            <span className="text-sm text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">{product.sold} đã bán</span>
          </div>

          {/* Flash Sale */}
          {product.isFlashSale && product.flashSaleEnd && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-red-500">⚡ Flash Sale</Badge>
                <CountdownTimer endTime={product.flashSaleEnd} />
              </div>
            </div>
          )}

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-red-600">{formatPrice(currentPrice)}</span>
              {currentPrice < product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  <Badge className="bg-red-500">-{product.discount}%</Badge>
                </>
              )}
            </div>
          </div>

          {/* Color selection */}
          {product.colors.length > 0 && (
            <div className="mb-4">
              <Label className="mb-2 block">Màu sắc</Label>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <Badge
                    key={color}
                    variant={selectedColor === color ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Customization */}
          {product.isCustomizable && product.customizationOptions && (
            <div className="mb-4 p-4 border rounded-lg bg-purple-50">
              <Label className="mb-2 block font-semibold">✨ Tùy chỉnh sản phẩm</Label>
              <div className="space-y-3">
                <Select value={customType} onValueChange={setCustomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại tùy chỉnh" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.customizationOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {customType && (
                  <Input
                    placeholder="Nhập nội dung cần in/khắc..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Wholesale pricing */}
          {product.wholesalePrice && product.wholesalePrice.length > 0 && (
            <div className="mb-4 p-4 border rounded-lg bg-green-50">
              <Label className="mb-2 block font-semibold">🏢 Giá sỉ</Label>
              <div className="grid grid-cols-3 gap-2">
                {product.wholesalePrice.map((wp, i) => (
                  <div key={i} className="text-center p-2 bg-white rounded border">
                    <div className="text-xs text-muted-foreground">Từ {wp.minQty} cái</div>
                    <div className="font-bold text-green-600">{formatPrice(wp.price)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-4">
            <Label>Số lượng</Label>
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center border-0 h-9"
              />
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">Còn {product.stock} sản phẩm</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5" /> Thêm vào giỏ
            </Button>
            <Button size="lg" variant="secondary" className="flex-1" onClick={handleBuyNow}>
              Mua ngay
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-1"
              onClick={() => {
                if (inWishlist) { removeFromWishlist(product.id); toast.info('Đã xóa khỏi yêu thích'); }
                else { addToWishlist(product.id); toast.success('Đã thêm vào yêu thích!'); }
              }}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const success = addToCompare(product.id);
                if (success) toast.success('Đã thêm vào so sánh!');
                else toast.error('Tối đa 3 sản phẩm so sánh');
              }}
            >
              <BarChart2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Shipping info */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: 'Miễn phí ship từ 500K' },
              { icon: Shield, text: 'Hàng chính hãng' },
              { icon: RotateCcw, text: 'Đổi trả 7 ngày' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="h-4 w-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="description">Mô tả</TabsTrigger>
          <TabsTrigger value="specs">Thông số</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá ({product.reviewCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-foreground leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <table className="w-full">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4 font-medium text-muted-foreground w-1/3">{key}</td>
                      <td className="py-2 px-4">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {/* Rating summary */}
              <div className="flex gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">{product.rating}</div>
                  <div className="flex justify-center my-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`h-4 w-4 ${star <= product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">{product.reviewCount} đánh giá</div>
                </div>
                <div className="flex-1 space-y-1">
                  {ratingDistribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-8">{star} ⭐</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Write review */}
              {isAuthenticated && (
                <div className="mb-8 p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3">Viết đánh giá</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">Đánh giá:</span>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setReviewRating(star)}>
                        <Star className={`h-5 w-5 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="mb-3"
                  />
                  <Button onClick={() => { toast.success('Đã gửi đánh giá!'); setReviewComment(''); }}>
                    Gửi đánh giá
                  </Button>
                </div>
              )}

              {/* Reviews list */}
              <div className="space-y-4">
                {product.reviews.map(review => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={review.userAvatar} alt={review.userName} className="h-8 w-8 rounded-full" />
                      <div>
                        <div className="font-medium text-sm">{review.userName}</div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{review.comment}</p>
                    <div className="mt-2">
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                        👍 Hữu ích ({review.helpful})
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
