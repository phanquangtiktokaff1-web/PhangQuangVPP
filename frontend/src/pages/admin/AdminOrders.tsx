import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Truck, RotateCcw, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { orderApi, formatPrice, type Order, type OrderStatus } from '@/lib/api-service';
import { toast } from 'sonner';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending:    { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed:  { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Đang xử lý',   color: 'bg-indigo-100 text-indigo-800' },
  shipping:   { label: 'Đang giao',    color: 'bg-purple-100 text-purple-800' },
  delivered:  { label: 'Đã giao',      color: 'bg-green-100 text-green-800' },
  cancelled:  { label: 'Đã hủy',       color: 'bg-red-100 text-red-800' },
  returned:   { label: 'Hoàn hàng',    color: 'bg-orange-100 text-orange-800' },
};

function getImageFileExtension(dataUrl?: string): string {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return 'png';
  const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/);
  if (!match?.[1]) return 'png';
  const subtype = match[1].toLowerCase();
  if (subtype.includes('jpeg')) return 'jpg';
  if (subtype.includes('svg')) return 'svg';
  if (subtype.includes('webp')) return 'webp';
  return 'png';
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getAllOrders({ status: statusFilter !== 'all' ? statusFilter : undefined, q: searchQuery || undefined });
      setOrders(data);
    } catch { toast.error('Không tải được đơn hàng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleSearch = () => fetchOrders();

  const handleStatus = async (id: string, status: string, note?: string) => {
    setUpdating(id);
    try {
      await orderApi.updateStatus(id, status, note);
      toast.success('Đã cập nhật trạng thái đơn hàng');
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as OrderStatus } : o));
    } catch { toast.error('Lỗi cập nhật trạng thái'); }
    finally { setUpdating(null); }
  };

  const handleReturn = async (id: string, action: 'approved' | 'rejected') => {
    setUpdating(id);
    try {
      await orderApi.approveReturn(id, action);
      toast.success(action === 'approved' ? 'Đã duyệt hoàn hàng' : 'Đã từ chối hoàn hàng');
      fetchOrders();
    } catch { toast.error('Lỗi xử lý hoàn hàng'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Quản lý đơn hàng</h2>
          <p className="text-sm text-muted-foreground">{orders.length} đơn hàng</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm theo mã đơn, tên KH..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead><TableHead>Khách hàng</TableHead>
                  <TableHead>Sản phẩm</TableHead><TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead className="text-center">Thanh toán</TableHead><TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Ngày đặt</TableHead><TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="text-sm">{order.shippingAddress?.name}</div>
                      <div className="text-xs text-muted-foreground">{order.shippingAddress?.phone}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.items?.length} sản phẩm
                      {(order.items?.filter(i => i.customization).length ?? 0) > 0 && (
                        <div className="text-xs text-purple-600 mt-0.5">{order.items.filter(i => i.customization).length} tùy chỉnh</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatPrice(order.total)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={order.paymentStatus === 'paid' ? 'default' : order.paymentStatus === 'refunded' ? 'destructive' : 'outline'}>
                        {order.paymentStatus === 'paid' ? 'Đã TT' : order.paymentStatus === 'refunded' ? 'Hoàn tiền' : 'Chưa TT'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={statusConfig[order.status]?.color}>{statusConfig[order.status]?.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                          <DialogHeader><DialogTitle>Chi tiết đơn hàng {order.id}</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <Badge className={statusConfig[order.status]?.color}>{statusConfig[order.status]?.label}</Badge>
                              <span className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Sản phẩm</h4>
                              {order.items?.map((item, i) => (
                                <div key={i} className="flex gap-3 py-2 border-b last:border-0">
                                  <img src={item.productImage} alt="" className="w-12 h-12 rounded object-cover" />
                                  <div className="flex-1">
                                    <div className="text-sm">{item.productName}</div>
                                    {item.customization && (
                                      <div className="text-xs text-purple-600 mt-0.5">
                                        Tùy chỉnh: {item.customization.type} - {item.customization.inputType === 'image' ? 'Ảnh thiết kế' : item.customization.text}
                                      </div>
                                    )}
                                    {item.customization?.inputType === 'image' && item.customization.text?.startsWith('data:image/') && (
                                      <div className="mt-1 flex items-center gap-2">
                                        <img src={item.customization.text} alt="Logo tùy chỉnh" className="h-12 w-12 rounded border object-cover" />
                                        <a
                                          href={item.customization.text}
                                          download={`${order.id}-${item.productId}-logo.${getImageFileExtension(item.customization.text)}`}
                                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                          <Download className="h-3 w-3" /> Tải logo
                                        </a>
                                      </div>
                                    )}
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
                              <p>{order.shippingAddress?.name} - {order.shippingAddress?.phone}</p>
                              <p className="text-muted-foreground">{order.shippingAddress?.street}, {order.shippingAddress?.ward}, {order.shippingAddress?.district}, {order.shippingAddress?.city}</p>
                            </div>
                            {order.note && <div className="text-sm p-3 bg-muted rounded"><span className="font-medium">Ghi chú:</span> {order.note}</div>}
                            <div className="flex gap-2 flex-wrap">
                              {order.status === 'pending' && (
                                <>
                                  <Button size="sm" className="gap-1" disabled={updating === order.id} onClick={() => handleStatus(order.id, 'confirmed')}>
                                    <CheckCircle className="h-3 w-3" /> Xác nhận
                                  </Button>
                                  <Button size="sm" variant="destructive" className="gap-1" disabled={updating === order.id} onClick={() => handleStatus(order.id, 'cancelled')}>
                                    <XCircle className="h-3 w-3" /> Hủy đơn
                                  </Button>
                                </>
                              )}
                              {order.status === 'confirmed' && (
                                <Button size="sm" className="gap-1" disabled={updating === order.id} onClick={() => handleStatus(order.id, 'shipping')}>
                                  <Truck className="h-3 w-3" /> Giao hàng
                                </Button>
                              )}
                              {order.status === 'shipping' && (
                                <Button size="sm" className="gap-1" disabled={updating === order.id} onClick={() => handleStatus(order.id, 'delivered')}>
                                  <CheckCircle className="h-3 w-3" /> Đã giao
                                </Button>
                              )}
                              {order.returnRequest && order.returnRequest.status === 'pending' && (
                                <>
                                  <p className="w-full text-sm text-orange-600 font-medium">⚠️ Lý do hoàn: {order.returnRequest.reason}</p>
                                  <Button size="sm" variant="outline" className="gap-1" disabled={updating === order.id} onClick={() => handleReturn(order.id, 'approved')}>
                                    <RotateCcw className="h-3 w-3" /> Duyệt hoàn
                                  </Button>
                                  <Button size="sm" variant="outline" className="gap-1 text-red-500" disabled={updating === order.id} onClick={() => handleReturn(order.id, 'rejected')}>
                                    <XCircle className="h-3 w-3" /> Từ chối
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && !loading && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Không có đơn hàng nào</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
