import { useState } from 'react';
import { Link } from 'react-router';
import { Package, Eye, RotateCcw, CheckCircle, Clock, Truck, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { mockOrders, formatPrice } from '@/lib/mock-data';
import type { OrderStatus } from '@/lib/mock-data';
import { toast } from 'sonner';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800', icon: Package },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle },
  returned: { label: 'Hoàn hàng', color: 'bg-orange-100 text-orange-800', icon: RotateCcw },
};

const paymentMethodLabels: Record<string, string> = {
  cod: 'COD',
  bank_transfer: 'Chuyển khoản',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
  vnpay: 'VNPay',
};

export function OrdersPage() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [returnReason, setReturnReason] = useState('');

  const filteredOrders = selectedTab === 'all'
    ? mockOrders
    : mockOrders.filter(o => o.status === selectedTab);

  const handleReturn = (orderId: string) => {
    if (!returnReason.trim()) {
      toast.error('Vui lòng nhập lý do hoàn hàng');
      return;
    }
    toast.success('Yêu cầu hoàn hàng đã được gửi!');
    setReturnReason('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
          <TabsTrigger value="confirmed">Đã xác nhận</TabsTrigger>
          <TabsTrigger value="shipping">Đang giao</TabsTrigger>
          <TabsTrigger value="delivered">Đã giao</TabsTrigger>
          <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Không có đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                return (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">{order.id}</CardTitle>
                          <Badge className={status.color}>{status.label}</Badge>
                          <Badge variant="outline">{paymentMethodLabels[order.paymentMethod]}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Items */}
                      <div className="space-y-3 mb-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex gap-3">
                            <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.productName}</div>
                              {item.customization && (
                                <div className="text-xs text-purple-600">✨ {item.customization.type}: {item.customization.text}</div>
                              )}
                              <div className="text-sm text-muted-foreground">x{item.quantity}</div>
                            </div>
                            <div className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</div>
                          </div>
                        ))}
                      </div>

                      <Separator className="mb-4" />

                      {/* Timeline */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {order.timeline.map((event, i) => {
                            const eventStatus = statusConfig[event.status as OrderStatus];
                            return (
                              <div key={i} className="flex items-center gap-1 shrink-0">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${i === order.timeline.length - 1 ? 'bg-primary text-primary-foreground' : 'bg-green-100 text-green-600'}`}>
                                  <CheckCircle className="h-3 w-3" />
                                </div>
                                <div className="text-xs">
                                  <div className="font-medium">{eventStatus?.label || event.status}</div>
                                  <div className="text-muted-foreground">{new Date(event.date).toLocaleDateString('vi-VN')}</div>
                                </div>
                                {i < order.timeline.length - 1 && <div className="w-8 h-0.5 bg-green-300 mx-1" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Return request */}
                      {order.returnRequest && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-sm">Yêu cầu hoàn hàng</span>
                            <Badge className={order.returnRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.returnRequest.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {order.returnRequest.status === 'pending' ? 'Đang xử lý' : order.returnRequest.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{order.returnRequest.reason}</p>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {order.status === 'delivered' && !order.returnRequest && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                  <RotateCcw className="h-3 w-3" /> Yêu cầu hoàn hàng
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Yêu cầu hoàn hàng - {order.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Lý do hoàn hàng</Label>
                                    <Textarea
                                      placeholder="Mô tả lý do bạn muốn hoàn hàng..."
                                      value={returnReason}
                                      onChange={(e) => setReturnReason(e.target.value)}
                                    />
                                  </div>
                                  <Button onClick={() => handleReturn(order.id)} className="w-full">
                                    Gửi yêu cầu
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          <Link to={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Eye className="h-3 w-3" /> Chi tiết
                            </Button>
                          </Link>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Tổng cộng</div>
                          <div className="font-bold text-red-600">{formatPrice(order.total)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
