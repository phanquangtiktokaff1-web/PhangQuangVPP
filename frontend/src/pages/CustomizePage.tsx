import { useState } from 'react';
import { Sparkles, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getCustomizableProducts, formatPrice } from '@/lib/mock-data';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';

export function CustomizePage() {
  const customizableProducts = getCustomizableProducts();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customType, setCustomType] = useState('');
  const [customText, setCustomText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactNote, setContactNote] = useState('');

  const addItem = useCartStore(s => s.addItem);

  const handleAddToCart = () => {
    if (!selectedProduct || !customType || !customText) {
      toast.error('Vui lòng chọn sản phẩm và nhập nội dung tùy chỉnh');
      return;
    }
    addItem(selectedProduct, quantity, { type: customType, text: customText });
    toast.success('Đã thêm sản phẩm tùy chỉnh vào giỏ hàng!');
  };

  const handleRequestQuote = () => {
    if (!contactName || !contactPhone) {
      toast.error('Vui lòng nhập thông tin liên hệ');
      return;
    }
    toast.success('Yêu cầu báo giá đã được gửi! Chúng tôi sẽ liên hệ bạn sớm.');
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-white/20 text-white border-0 mb-4 text-lg px-4 py-1">
            <Sparkles className="h-5 w-5 mr-1" /> Tùy chỉnh sản phẩm
          </Badge>
          <h1 className="text-4xl font-bold mb-4">In tên, logo lên sản phẩm</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Tạo dấu ấn riêng cho doanh nghiệp với dịch vụ in ấn, khắc laser trên bút, sổ tay, cốc đựng bút. 
            Phù hợp cho quà tặng doanh nghiệp, sự kiện, hội nghị.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Products */}
          <div>
            <h2 className="text-xl font-bold mb-4">Sản phẩm có thể tùy chỉnh</h2>
            <div className="grid grid-cols-2 gap-4">
              {customizableProducts.map(product => (
                <Card key={product.id} className={`cursor-pointer transition-all ${selectedProduct === product.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedProduct(product.id)}>
                  <CardContent className="p-3">
                    <img src={product.images[0]?.url} alt={product.name} className="w-full h-32 object-cover rounded-md mb-2" />
                    <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-600 text-sm">{formatPrice(product.price)}</span>
                      <Badge variant="secondary" className="text-xs">✨ Tùy chỉnh</Badge>
                    </div>
                    {product.customizationOptions && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.customizationOptions.map(opt => (
                          <Badge key={opt} variant="outline" className="text-xs">{opt}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Customization form */}
          <div>
            <h2 className="text-xl font-bold mb-4">Thông tin tùy chỉnh</h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Sản phẩm đã chọn</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {customizableProducts.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && (
                  <>
                    <div className="space-y-2">
                      <Label>Loại tùy chỉnh</Label>
                      <Select value={customType} onValueChange={setCustomType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại tùy chỉnh" />
                        </SelectTrigger>
                        <SelectContent>
                          {customizableProducts.find(p => p.id === selectedProduct)?.customizationOptions?.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Nội dung in/khắc</Label>
                      <Input
                        placeholder="VD: Công ty ABC, Nguyễn Văn A..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Số lượng</Label>
                      <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>

                    {/* Preview */}
                    {customText && (
                      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                        <Label className="text-xs text-muted-foreground mb-2 block">Xem trước</Label>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-primary">{customText}</div>
                          <div className="text-xs text-muted-foreground mt-1">{customType}</div>
                        </div>
                      </div>
                    )}

                    <Button className="w-full gap-2" onClick={handleAddToCart}>
                      <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ hàng
                    </Button>
                  </>
                )}

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Đặt hàng số lượng lớn? Liên hệ báo giá</h3>
                  <div className="space-y-3">
                    <Input placeholder="Họ tên" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                    <Input placeholder="Số điện thoại" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                    <Textarea placeholder="Mô tả yêu cầu..." value={contactNote} onChange={(e) => setContactNote(e.target.value)} />
                    <Button variant="outline" className="w-full" onClick={handleRequestQuote}>
                      Gửi yêu cầu báo giá
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
