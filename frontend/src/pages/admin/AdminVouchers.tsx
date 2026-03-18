import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { voucherApi, formatPrice, type Voucher } from '@/lib/api-service';
import { toast } from 'sonner';

const empty = { code:'', type:'percentage', value:'', maxDiscount:'', minOrderValue:'', usageLimit:'100', startDate:'', endDate:'', description:'' };

export function AdminVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const fetchVouchers = async () => {
    setLoading(true);
    try { setVouchers(await voucherApi.getAll()); }
    catch { toast.error('Không tải được voucher'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchVouchers(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowDialog(true); };
  const openEdit = (v: Voucher) => {
    setEditing(v);
    setForm({ code:v.code, type:v.type, value:String(v.value), maxDiscount:String(v.maxDiscount||''), minOrderValue:String(v.minOrderValue||0), usageLimit:String(v.usageLimit||100), startDate:v.startDate.slice(0,10), endDate:v.endDate.slice(0,10), description:v.description||'' });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.value || !form.startDate || !form.endDate) { toast.error('Vui lòng điền đầy đủ'); return; }
    setSaving(true);
    try {
      const payload = { code:form.code, type:form.type as 'percentage'|'fixed', value:Number(form.value), maxDiscount:form.maxDiscount ? Number(form.maxDiscount) : undefined, minOrderValue:Number(form.minOrderValue)||0, usageLimit:Number(form.usageLimit)||100, startDate:new Date(form.startDate).toISOString(), endDate:new Date(form.endDate).toISOString(), description:form.description };
      if (editing) { await voucherApi.update(editing.id, payload); toast.success('Đã cập nhật voucher!'); }
      else { await voucherApi.create(payload); toast.success('Đã tạo voucher!'); }
      setShowDialog(false); fetchVouchers();
    } catch (e: unknown) {
      toast.error((e as {response?:{data?:{message?:string}}})?.response?.data?.message || 'Lỗi lưu voucher');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa voucher này?')) return;
    try { await voucherApi.delete(id); toast.success('Đã xóa voucher'); setVouchers(prev => prev.filter(v => v.id !== id)); }
    catch { toast.error('Lỗi xóa voucher'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Quản lý Voucher / Mã giảm giá</h2>
          <p className="text-sm text-muted-foreground">{vouchers.length} voucher</p>
        </div>
        <Button className="gap-2" onClick={openAdd}><Plus className="h-4 w-4" /> Tạo voucher</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead><TableHead>Mô tả</TableHead><TableHead className="text-center">Loại</TableHead>
                  <TableHead className="text-right">Giá trị</TableHead><TableHead className="text-center">Sử dụng</TableHead>
                  <TableHead className="text-center">Thời hạn</TableHead><TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map(v => {
                  const usagePct = (v.usedCount / v.usageLimit) * 100;
                  return (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{v.code}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(v.code); toast.success('Đã copy!'); }}><Copy className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{v.description}</TableCell>
                      <TableCell className="text-center"><Badge variant="outline">{v.type === 'percentage' ? '%' : 'VNĐ'}</Badge></TableCell>
                      <TableCell className="text-right font-medium">
                        {v.type === 'percentage' ? `${v.value}%` : formatPrice(v.value)}
                        {v.maxDiscount && <div className="text-xs text-muted-foreground">Max: {formatPrice(v.maxDiscount)}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">{v.usedCount}/{v.usageLimit}</div>
                          <Progress value={usagePct} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        <div>{new Date(v.startDate).toLocaleDateString('vi-VN')}</div>
                        <div className="text-muted-foreground">→ {new Date(v.endDate).toLocaleDateString('vi-VN')}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={v.status === 'active' ? 'default' : v.status === 'expired' ? 'secondary' : 'destructive'}>
                          {v.status === 'active' ? 'Hoạt động' : v.status === 'expired' ? 'Hết hạn' : 'Vô hiệu'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {vouchers.length === 0 && !loading && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Chưa có voucher nào</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Mã voucher *</Label><Input value={form.code} onChange={e => setForm(p => ({...p,code:e.target.value.toUpperCase()}))} placeholder="VD: SALE20" disabled={!!editing} /></div>
              <div className="space-y-2"><Label>Loại giảm giá</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({...p,type:v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percentage">Phần trăm (%)</SelectItem><SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Giá trị giảm *</Label><Input type="number" value={form.value} onChange={e => setForm(p => ({...p,value:e.target.value}))} /></div>
              <div className="space-y-2"><Label>Giảm tối đa (VNĐ)</Label><Input type="number" value={form.maxDiscount} onChange={e => setForm(p => ({...p,maxDiscount:e.target.value}))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Đơn tối thiểu (VNĐ)</Label><Input type="number" value={form.minOrderValue} onChange={e => setForm(p => ({...p,minOrderValue:e.target.value}))} /></div>
              <div className="space-y-2"><Label>Giới hạn sử dụng</Label><Input type="number" value={form.usageLimit} onChange={e => setForm(p => ({...p,usageLimit:e.target.value}))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ngày bắt đầu *</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({...p,startDate:e.target.value}))} /></div>
              <div className="space-y-2"><Label>Ngày kết thúc *</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({...p,endDate:e.target.value}))} /></div>
            </div>
            <div className="space-y-2"><Label>Mô tả</Label><Input value={form.description} onChange={e => setForm(p => ({...p,description:e.target.value}))} /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Hủy</Button>
              <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
