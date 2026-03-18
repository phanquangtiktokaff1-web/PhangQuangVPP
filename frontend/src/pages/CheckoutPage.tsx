import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { MapPin, CreditCard, Truck, FileText, CheckCircle, Banknote, Building, Smartphone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice, getProductById } from '@/lib/mock-data';
import type { PaymentMethod, ShippingMethod } from '@/lib/mock-data';
import { toast } from 'sonner';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items, paymentMethod, shippingMethod, voucherCode, voucherDiscount, note,
    setPaymentMethod, setShippingMethod, setNote,
    getSubtotal, getShippingFee, getTotal, clearCart
  } = useCartStore();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId] = useState(`ORD-${Date.now().toString().slice(-6)}`);

  // Address form state
  const [addrName, setAddrName] = useState(user?.addresses[0]?.name || user?.name || '');
  const [addrPhone, setAddrPhone] = useState(user?.addresses[0]?.phone || user?.phone || '');
  const [addrStreet, setAddrStreet] = useState(user?.addresses[0]?.street || '');
  const [addrWard, setAddrWard] = useState(user?.addresses[0]?.ward || '');
  const [addrDistrict, setAddrDistrict] = useState(user?.addresses[0]?.district || '');
  const [addrCity, setAddrCity] = useState(user?.addresses[0]?.city || '');

  const cartProducts = items.map(item => ({
    ...item,
    product: getProductById(item.productId)!,
  })).filter(item => item.product);

  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = () => {
    if (!addrName || !addrPhone || !addrStreet || !addrCity) {
      toast.error('Vui lòng nhập đầy đủ địa chỉ giao hàng');
      return;
    }
    setOrderPlaced(true);
    clearCart();
    toast.success('Đặt hàng thành công!');
  };

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
        <p className="text-muted-foreground mb-2">Mã đơn hàng: <span className="font-bold text-foreground">{orderId}</span></p>
        <p className="text-muted-foreground mb-6">Cảm ơn bạn đã mua hàng tại VP Shop. Chúng tôi sẽ xử lý đơn hàng trong thời gian sớm nhất.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/orders"><Button>Xem đơn hàng</Button></Link>
          <Link to="/"><Button variant="outline">Tiếp tục mua sắm</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Quick select from saved addresses */}
              {user && user.addresses.length > 0 && (
                <div className="mb-4">
                  <Label className="mb-2 block text-sm">Chọn địa chỉ đã lưu:</Label>
                  <div className="flex flex-wrap gap-2">
                    {user.addresses.map(addr => (
                      <Badge
                        key={addr.id}
                        variant={addrStreet === addr.street ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          setAddrName(addr.name);
                          setAddrPhone(addr.phone);
                          setAddrStreet(addr.street);
                          setAddrWard(addr.ward);
                          setAddrDistrict(addr.district);
                          setAddrCity(addr.city);
                        }}
                      >
                        {addr.name} {addr.isDefault && '(Mặc định)'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Họ tên người nhận</Label>
                  <Input value={addrName} onChange={(e) => setAddrName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Địa chỉ</Label>
                  <Input value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} placeholder="Số nhà, tên đường" />
                </div>
                <div className="space-y-2">
                  <Label>Phường/Xã</Label>
                  <Input value={addrWard} onChange={(e) => setAddrWard(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Quận/Huyện</Label>
                  <Input value={addrDistrict} onChange={(e) => setAddrDistrict(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tỉnh/Thành phố</Label>
                  <Input value={addrCity} onChange={(e) => setAddrCity(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Phương thức vận chuyển
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={shippingMethod} onValueChange={(v) => setShippingMethod(v as ShippingMethod)}>
                <div className="space-y-3">
                  {[
                    { value: 'standard', label: 'Giao hàng tiêu chuẩn', desc: '3-5 ngày làm việc', price: 25000 },
                    { value: 'express', label: 'Giao hàng nhanh', desc: '1-2 ngày làm việc', price: 35000 },
                    { value: 'same_day', label: 'Giao trong ngày', desc: 'Nhận hàng trong ngày (nội thành)', price: 50000 },
                  ].map(method => (
                    <label key={method.value} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent ${shippingMethod === method.value ? 'border-primary bg-primary/5' : ''}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={method.value} />
                        <div>
                          <div className="font-medium text-sm">{method.label}</div>
                          <div className="text-xs text-muted-foreground">{method.desc}</div>
                        </div>
                      </div>
                      <span className="font-medium text-sm">
                        {getSubtotal() >= 500000 ? <span className="text-green-600">Miễn phí</span> : formatPrice(method.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Phương thức thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <div className="space-y-3">
                  {[
                    { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: <Banknote className="h-5 w-5 text-gray-500" /> },
                    { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: <Building className="h-5 w-5 text-blue-500" /> },
                    { value: 'momo', label: 'Ví MoMo', icon: <Smartphone className="h-5 w-5 text-pink-500" /> },
                    { value: 'zalopay', label: 'ZaloPay', icon: <CreditCard className="h-5 w-5 text-blue-600" /> },
                    { value: 'vnpay', label: 'VNPay', icon: <ShieldCheck className="h-5 w-5 text-red-500" /> },
                  ].map(method => (
                    <label key={method.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent ${paymentMethod === method.value ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value={method.value} />
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-background">{method.icon}</span>
                      <span className="font-medium text-sm">{method.label}</span>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Note */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Ghi chú
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ghi chú cho đơn hàng (không bắt buộc)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Đơn hàng ({items.length} sản phẩm)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Products */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cartProducts.map(({ productId, quantity, product }) => {
                  const price = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
                  return (
                    <div key={productId} className="flex gap-3">
                      <img src={product.images[0]?.url} alt={product.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{product.name}</div>
                        <div className="text-xs text-muted-foreground">x{quantity}</div>
                      </div>
                      <div className="text-sm font-medium">{formatPrice(price * quantity)}</div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice(getSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span>{getShippingFee() === 0 ? <span className="text-green-600">Miễn phí</span> : formatPrice(getShippingFee())}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({voucherCode})</span>
                    <span>-{formatPrice(voucherDiscount)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span className="text-red-600">{formatPrice(getTotal())}</span>
              </div>

              <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
                Đặt hàng
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của VP Shop
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
