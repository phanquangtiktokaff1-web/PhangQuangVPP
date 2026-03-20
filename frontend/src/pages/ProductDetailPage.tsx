import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ShoppingCart, Heart, Star, Minus, Plus, Sparkles, Building2 } from 'lucide-react';
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
import { ProductCard } from '@/components/product/ProductCard';
import { catalogApi, formatPrice, normalizeCustomizationOptions, type Product } from '@/lib/api-service';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Product['reviews']>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [customType, setCustomType] = useState('');
  const [customText, setCustomText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const addItem = useCartStore(s => s.addItem);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    catalogApi.getProduct(slug)
      .then(async p => {
        setProduct(p);

        const [related, productReviews] = await Promise.all([
          catalogApi.getProducts({ categoryId: p.categoryId, limit: 4 }),
          catalogApi.getReviews(p.id).catch(() => p.reviews ?? []),
        ]);

        setReviews(productReviews);
        return related.filter(r => r.id !== p.id).slice(0, 4);
      })
      .then(setRelatedProducts)
      .catch(() => {
        setProduct(null);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    setCustomText('');
  }, [customType]);

  if (loading) return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Đang tải...</div>;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h1>
        <Link to="/"><Button>Về trang chủ</Button></Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const currentPrice = product.price;
  const customizationOptions = normalizeCustomizationOptions(product.customizationOptions);
  const selectedCustomization = customizationOptions.find(opt => opt.key === customType);
  const customizationExtraPrice = selectedCustomization?.extraPrice || 0;
  const effectiveUnitPrice = currentPrice + customizationExtraPrice;

  const handleAddToCart = async () => {
    if (product.isCustomizable && (customType || customText) && (!customType || !customText.trim())) {
      toast.error('Vui lòng chọn loại tùy chỉnh và nhập đầy đủ nội dung tùy chỉnh');
      return;
    }
    const customization = selectedCustomization && customText
      ? { type: selectedCustomization.label, text: customText.trim(), extraPrice: customizationExtraPrice, inputType: selectedCustomization.inputType }
      : undefined;
    await addItem(product.id, quantity, customization);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      await catalogApi.submitReview(product.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      const [latestProduct, latestReviews] = await Promise.all([
        catalogApi.getProduct(product.slug),
        catalogApi.getReviews(product.id),
      ]);

      setProduct(latestProduct);
      setReviews(latestReviews);
      setReviewComment('');
      toast.success('Đã gửi đánh giá!');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Không gửi được đánh giá, vui lòng thử lại');
    }
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>/</span>
        <span>/</span>
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
            {product.brandId && <Badge variant="outline">{product.brandId}</Badge>}
          </div>

          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`h-4 w-4 ${star <= product.rating ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`} />
              ))}
              <span className="text-sm font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">{product.reviewCount} đánh giá</span>
            <span className="text-sm text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">{product.sold} đã bán</span>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-rose-600">{formatPrice(effectiveUnitPrice)}</span>
              {currentPrice < product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  <Badge className="bg-rose-600 text-white">-{product.discount}%</Badge>
                </>
              )}
            </div>
            {customizationExtraPrice > 0 && (
              <div className="text-xs text-muted-foreground mt-1">Giá gốc {formatPrice(currentPrice)} + phụ phí tùy chỉnh {formatPrice(customizationExtraPrice)}</div>
            )}
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
          {product.isCustomizable && customizationOptions.length > 0 && (
            <div className="mb-4 p-4 border rounded-lg bg-purple-50">
              <Label className="mb-2 block font-semibold flex items-center gap-1"><Sparkles className="h-4 w-4" /> Tùy chỉnh sản phẩm</Label>
              <div className="space-y-3">
                <Select value={customType} onValueChange={setCustomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại tùy chỉnh" />
                  </SelectTrigger>
                  <SelectContent>
                    {customizationOptions.map(opt => (
                      <SelectItem key={opt.key} value={opt.key}>{opt.label}{opt.extraPrice ? ` (+${formatPrice(opt.extraPrice)})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {customType && (
                  <div className="space-y-1">
                    {selectedCustomization?.inputType === 'image' ? (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setCustomText(String(reader.result || ''));
                            reader.readAsDataURL(file);
                          }}
                        />
                        {customText && (
                          <img src={customText} alt="Ảnh tùy chỉnh" className="h-28 w-28 rounded border object-cover" />
                        )}
                      </div>
                    ) : (
                      <Input
                        placeholder={selectedCustomization?.placeholder || 'Nhập nội dung tùy chỉnh...'}
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                      />
                    )}
                    {selectedCustomization?.helpText && (
                      <p className="text-xs text-muted-foreground">{selectedCustomization.helpText}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wholesale pricing */}
          {product.wholesalePrice && product.wholesalePrice.length > 0 && (
            <div className="mb-4 p-3 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center gap-1.5 text-green-800 font-semibold text-sm mb-2">
                <Building2 className="h-4 w-4" /> Giá mua sỉ
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.wholesalePrice.map((wp, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 border border-green-200 text-sm">
                    <span className="text-muted-foreground">≥{wp.minQty} cái:</span>
                    <span className="font-bold text-green-700">{formatPrice(wp.price)}</span>
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
          <div className="space-y-2 mb-6">
            <div className="flex gap-2">
              <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ
              </Button>
              <Button size="lg" variant="secondary" className="flex-1" onClick={handleBuyNow}>
                Mua ngay
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                if (inWishlist) { removeFromWishlist(product.id); toast.info('Đã xóa khỏi yêu thích'); }
                else { addToWishlist(product.id); toast.success('Đã thêm vào yêu thích!'); }
              }}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              {inWishlist ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            </Button>
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
              {Object.keys(product.specifications || {}).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sản phẩm chưa có thông số kỹ thuật.</p>
              ) : (
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
              )}
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
                  <div className="text-sm text-muted-foreground">{product.reviewCount || reviews.length} đánh giá</div>
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
                  <Button onClick={() => void handleSubmitReview()}>
                    Gửi đánh giá
                  </Button>
                </div>
              )}

              {/* Reviews list */}
              <div className="space-y-4">
                {reviews.map(review => (
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
                {reviews.length === 0 && (
                  <p className="text-sm text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
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
