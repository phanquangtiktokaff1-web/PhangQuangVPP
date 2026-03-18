import { useState } from 'react';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { mockVouchers, formatPrice } from '@/lib/mock-data';
import { toast } from 'sonner';

export function AdminVouchers() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Quản lý Voucher / Mã giảm giá</h2>
          <p className="text-sm text-muted-foreground">{mockVouchers.length} voucher</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Tạo voucher</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo voucher mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã voucher</Label>
                  <Input placeholder="VD: SALE20" />
                </div>
                <div className="space-y-2">
                  <Label>Loại giảm giá</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                      <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giá trị giảm</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Giảm tối đa (VNĐ)</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Đơn tối thiểu (VNĐ)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Giới hạn sử dụng</Label>
                  <Input type="number" placeholder="100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày bắt đầu</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Ngày kết thúc</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Input placeholder="Mô tả voucher..." />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Hủy</Button>
                <Button onClick={() => { toast.success('Đã tạo voucher!'); setShowAddDialog(false); }}>Tạo voucher</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vouchers table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Loại</TableHead>
                <TableHead className="text-right">Giá trị</TableHead>
                <TableHead className="text-center">Sử dụng</TableHead>
                <TableHead className="text-center">Thời hạn</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVouchers.map(voucher => {
                const usagePercent = (voucher.usedCount / voucher.usageLimit) * 100;
                return (
                  <TableRow key={voucher.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{voucher.code}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(voucher.code); toast.success('Đã copy!'); }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{voucher.description}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{voucher.type === 'percentage' ? '%' : 'VNĐ'}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {voucher.type === 'percentage' ? `${voucher.value}%` : formatPrice(voucher.value)}
                      {voucher.maxDiscount && <div className="text-xs text-muted-foreground">Max: {formatPrice(voucher.maxDiscount)}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{voucher.usedCount}/{voucher.usageLimit}</div>
                        <Progress value={usagePercent} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      <div>{new Date(voucher.startDate).toLocaleDateString('vi-VN')}</div>
                      <div className="text-muted-foreground">→ {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={voucher.status === 'active' ? 'default' : voucher.status === 'expired' ? 'secondary' : 'destructive'}>
                        {voucher.status === 'active' ? 'Hoạt động' : voucher.status === 'expired' ? 'Hết hạn' : 'Vô hiệu'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => toast.success('Đã xóa voucher')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
