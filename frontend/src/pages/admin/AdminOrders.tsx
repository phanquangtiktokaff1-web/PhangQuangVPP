import { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, Truck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { mockOrders, formatPrice } from '@/lib/mock-data';
import type { OrderStatus } from '@/lib/mock-data';
import { toast } from 'sonner';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  returned: { label: 'Hoàn hàng', color: 'bg-orange-100 text-orange-800' },
};

export function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = mockOrders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Quản lý đơn hàng</h2>
          <p className="text-sm text-muted-foreground">{mockOrders.length} đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm theo mã đơn, tên KH..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="text-center">Thanh toán</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Ngày đặt</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{order.shippingAddress.name}</div>
                      <div className="text-xs text-muted-foreground">{order.shippingAddress.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{order.items.length} sản phẩm</TableCell>
                  <TableCell className="text-right font-medium">{formatPrice(order.total)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={order.paymentStatus === 'paid' ? 'default' : order.paymentStatus === 'refunded' ? 'destructive' : 'outline'}>
                      {order.paymentStatus === 'paid' ? 'Đã TT' : order.paymentStatus === 'refunded' ? 'Hoàn tiền' : 'Chưa TT'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={statusConfig[order.status].color}>
                      {statusConfig[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Chi tiết đơn hàng {order.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <Badge className={statusConfig[order.status].color}>{statusConfig[order.status].label}</Badge>
                              <span className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                            </div>

                            <div>
                              <h4 className="font-semibold text-sm mb-2">Sản phẩm</h4>
                              {order.items.map((item, i) => (
                                <div key={i} className="flex gap-3 py-2 border-b last:border-0">
                                  <img src={item.productImage} alt="" className="w-12 h-12 rounded object-cover" />
                                  <div className="flex-1">
                                    <div className="text-sm">{item.productName}</div>
                                    <div className="text-xs text-muted-foreground">x{item.quantity}</div>
                                  </div>
                                  <div className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</div>
                                </div>
                              ))}
                            </div>

                            <Separator />

                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
                              <div className="flex justify-between"><span>Phí ship</span><span>{formatPrice(order.shippingFee)}</span></div>
                              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{formatPrice(order.discount)}</span></div>}
                              <div className="flex justify-between font-bold text-lg"><span>Tổng</span><span className="text-red-600">{formatPrice(order.total)}</span></div>
                            </div>

                            <Separator />

                            <div className="text-sm">
                              <h4 className="font-semibold mb-1">Địa chỉ giao hàng</h4>
                              <p>{order.shippingAddress.name} - {order.shippingAddress.phone}</p>
                              <p className="text-muted-foreground">{order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}</p>
                            </div>

                            <div className="flex gap-2">
                              {order.status === 'pending' && (
                                <>
                                  <Button size="sm" className="gap-1" onClick={() => toast.success('Đã xác nhận đơn hàng')}>
                                    <CheckCircle className="h-3 w-3" /> Xác nhận
                                  </Button>
                                  <Button size="sm" variant="destructive" className="gap-1" onClick={() => toast.success('Đã hủy đơn hàng')}>
                                    <XCircle className="h-3 w-3" /> Hủy đơn
                                  </Button>
                                </>
                              )}
                              {order.status === 'confirmed' && (
                                <Button size="sm" className="gap-1" onClick={() => toast.success('Đã chuyển sang đang giao')}>
                                  <Truck className="h-3 w-3" /> Giao hàng
                                </Button>
                              )}
                              {order.status === 'shipping' && (
                                <Button size="sm" className="gap-1" onClick={() => toast.success('Đã xác nhận giao thành công')}>
                                  <CheckCircle className="h-3 w-3" /> Đã giao
                                </Button>
                              )}
                              {order.returnRequest && (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success('Đã duyệt hoàn hàng')}>
                                    <RotateCcw className="h-3 w-3" /> Duyệt hoàn
                                  </Button>
                                  <Button size="sm" variant="outline" className="gap-1 text-red-500" onClick={() => toast.success('Đã từ chối hoàn hàng')}>
                                    <XCircle className="h-3 w-3" /> Từ chối
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
