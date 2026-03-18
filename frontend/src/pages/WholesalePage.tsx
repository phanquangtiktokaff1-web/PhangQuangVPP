import { useState, useEffect } from 'react';
import { Building2, Calculator, Send, CheckCircle, BadgePercent, Truck, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { catalogApi, formatPrice, type Product } from '@/lib/api-service';
import { toast } from 'sonner';

export function WholesalePage() {
  const [wholesaleProducts, setWholesaleProducts] = useState<Product[]>([]);
  useEffect(() => { catalogApi.getProducts({ hasWholesale: true }).then(setWholesaleProducts).catch(() => {}); }, []);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(50);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedProductData = wholesaleProducts.find(p => p.id === selectedProduct);
  const applicablePrice = selectedProductData?.wholesalePrice?.reduce((best, wp) => {
    if (quantity >= wp.minQty && (!best || wp.price < best.price)) return wp;
    return best;
  }, null as { minQty: number; price: number } | null);

  const handleSubmit = () => {
    if (!companyName || !contactName || !contactPhone) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setSubmitted(true);
    toast.success('Yêu cầu báo giá đã được gửi thành công!');
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Yêu cầu đã được gửi!</h1>
        <p className="text-muted-foreground mb-6">
          Cảm ơn bạn đã quan tâm đến dịch vụ mua sỉ của VP Shop. 
          Đội ngũ kinh doanh sẽ liên hệ bạn trong vòng 24 giờ.
        </p>
        <Button onClick={() => setSubmitted(false)}>Gửi yêu cầu khác</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-white/20 text-white border-0 mb-4 text-lg px-4 py-1">
            <Building2 className="h-5 w-5 mr-1" /> Mua hàng sỉ
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Giá sỉ ưu đãi cho doanh nghiệp</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Đặt hàng từ 50 sản phẩm trở lên để nhận giá sỉ đặc biệt. 
            Giảm đến 40% so với giá lẻ. Hỗ trợ in ấn logo, xuất hóa đơn VAT.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Benefits */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <BadgePercent className="h-8 w-8 text-primary mx-auto" />, title: 'Giảm đến 40%', desc: 'So với giá lẻ' },
            { icon: <Truck className="h-8 w-8 text-primary mx-auto" />, title: 'Miễn phí vận chuyển', desc: 'Đơn từ 1 triệu' },
            { icon: <FileText className="h-8 w-8 text-primary mx-auto" />, title: 'Xuất hóa đơn VAT', desc: 'Đầy đủ chứng từ' },
            { icon: <Sparkles className="h-8 w-8 text-primary mx-auto" />, title: 'In logo miễn phí', desc: 'Từ 100 sản phẩm' },
          ].map((item, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <div className="mb-2 flex justify-center">{item.icon}</div>
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Price table */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" /> Bảng giá sỉ
            </h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Giá lẻ</TableHead>
                      <TableHead className="text-right">Từ 50</TableHead>
                      <TableHead className="text-right">Từ 100</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wholesaleProducts.map(product => (
                      <TableRow key={product.id} className="cursor-pointer hover:bg-accent" onClick={() => setSelectedProduct(product.id)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img src={product.images[0]?.url} alt={product.name} className="w-8 h-8 rounded object-cover" />
                            <span className="text-sm">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm">{formatPrice(product.price)}</TableCell>
                        {product.wholesalePrice?.slice(0, 2).map((wp, i) => (
                          <TableCell key={i} className="text-right text-sm font-medium text-green-600">
                            {formatPrice(wp.price)}
                          </TableCell>
                        ))}
                        {(!product.wholesalePrice || product.wholesalePrice.length < 2) && (
                          <TableCell className="text-right text-sm text-muted-foreground">Liên hệ</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Calculator */}
            {selectedProductData && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Tính giá nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={selectedProductData.images[0]?.url} alt="" className="w-12 h-12 rounded object-cover" />
                    <div>
                      <div className="font-medium text-sm">{selectedProductData.name}</div>
                      <div className="text-xs text-muted-foreground">Giá lẻ: {formatPrice(selectedProductData.price)}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Số lượng</Label>
                    <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
                  </div>
                  {applicablePrice ? (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Đơn giá sỉ: <span className="font-bold text-green-600">{formatPrice(applicablePrice.price)}</span></div>
                      <div className="text-sm text-muted-foreground">Thành tiền: <span className="font-bold text-green-600 text-lg">{formatPrice(applicablePrice.price * quantity)}</span></div>
                      <div className="text-xs text-green-600 mt-1">
                        Tiết kiệm: {formatPrice((selectedProductData.price - applicablePrice.price) * quantity)} ({Math.round((1 - applicablePrice.price / selectedProductData.price) * 100)}%)
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                      Đặt từ {selectedProductData.wholesalePrice?.[0]?.minQty || 50} sản phẩm để nhận giá sỉ
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quote request form */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Send className="h-5 w-5" /> Yêu cầu báo giá
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Tên công ty / Tổ chức *</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Công ty TNHH ABC" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Người liên hệ *</Label>
                    <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại *</Label>
                    <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Sản phẩm quan tâm</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {wholesaleProducts.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Số lượng dự kiến</Label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
                </div>
                <div className="space-y-2">
                  <Label>Ghi chú / Yêu cầu đặc biệt</Label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Cần in logo, xuất hóa đơn VAT..." />
                </div>
                <Button className="w-full" size="lg" onClick={handleSubmit}>
                  <Send className="h-4 w-4 mr-2" /> Gửi yêu cầu báo giá
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
