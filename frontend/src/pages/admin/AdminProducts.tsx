import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { catalogApi, formatPrice, type Product, type Category, type Brand } from '@/lib/api-service';
import { toast } from 'sonner';

const empty = { name:'',sku:'',categoryId:'',brandId:'',price:'',originalPrice:'',stock:'',description:'',imageUrl:'' };

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchProducts = async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const data = await catalogApi.getProducts({ ...params, status: undefined });
      setProducts(data);
    } catch { toast.error('Không tải được danh sách sản phẩm'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    Promise.all([catalogApi.getCategories(), catalogApi.getBrands()]).then(([cats, brs]) => {
      setCategories(cats); setBrands(brs);
    });
    fetchProducts();
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const params: Record<string, string> = {};
      if (searchQuery) params.q = searchQuery;
      if (categoryFilter !== 'all') params.categoryId = categoryFilter;
      fetchProducts(params);
    }, 350);
  }, [searchQuery, categoryFilter]);

  const openAdd = () => { setEditing(null); setForm(empty); setShowDialog(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name:p.name, sku:p.sku, categoryId:p.categoryId, brandId:p.brandId, price:String(p.price), originalPrice:String(p.originalPrice), stock:String(p.stock), description:p.description, imageUrl:p.images[0]?.url||'' });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.price) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { name:form.name, categoryId:form.categoryId, brandId:form.brandId, price:Number(form.price), originalPrice:Number(form.originalPrice)||Number(form.price), stock:Number(form.stock)||0, description:form.description, images: form.imageUrl ? [{id:'img1',url:form.imageUrl,alt:form.name}] : [] };
      if (editing) {
        await catalogApi.updateProduct(editing.id, payload);
        toast.success('Đã cập nhật sản phẩm!');
      } else {
        payload.sku = form.sku;
        await catalogApi.createProduct(payload);
        toast.success('Đã thêm sản phẩm!');
      }
      setShowDialog(false);
      fetchProducts();
    } catch (e: unknown) {
      toast.error((e as {response?:{data?:{message?:string}}})?.response?.data?.message || 'Lỗi lưu sản phẩm');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await catalogApi.deleteProduct(id);
      toast.success('Đã xóa sản phẩm');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch { toast.error('Lỗi xóa sản phẩm'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Quản lý sản phẩm</h2>
          <p className="text-sm text-muted-foreground">{products.length} sản phẩm</p>
        </div>
        <Button className="gap-2" onClick={openAdd}><Plus className="h-4 w-4" /> Thêm sản phẩm</Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm theo tên, SKU..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Danh mục" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead><TableHead>SKU</TableHead><TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Giá</TableHead><TableHead className="text-center">Tồn kho</TableHead>
                  <TableHead className="text-center">Đã bán</TableHead><TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => {
                  const category = categories.find(c => c.id === product.categoryId);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={product.images[0]?.url} alt={product.name} className="w-10 h-10 rounded object-cover" />
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{brands.find(b => b.id === product.brandId)?.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{product.sku}</TableCell>
                      <TableCell><Badge variant="outline">{category?.name}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{formatPrice(product.price)}</div>
                        {product.discount > 0 && <div className="text-xs text-red-500">-{product.discount}%</div>}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {product.stock < 100 && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                          <span className={product.stock < 100 ? 'text-orange-600 font-medium' : ''}>{product.stock}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{product.sold}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(product.id, product.name)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {products.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Không tìm thấy sản phẩm</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tên sản phẩm *</Label><Input value={form.name} onChange={e => setForm(p => ({...p,name:e.target.value}))} placeholder="Nhập tên sản phẩm" /></div>
              <div className="space-y-2"><Label>Mã SKU *</Label><Input value={form.sku} onChange={e => setForm(p => ({...p,sku:e.target.value}))} placeholder="VD: TL-027-BL" disabled={!!editing} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Danh mục</Label>
                <Select value={form.categoryId} onValueChange={v => setForm(p => ({...p,categoryId:v}))}>
                  <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Thương hiệu</Label>
                <Select value={form.brandId} onValueChange={v => setForm(p => ({...p,brandId:v}))}>
                  <SelectTrigger><SelectValue placeholder="Chọn thương hiệu" /></SelectTrigger>
                  <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Giá bán *</Label><Input type="number" value={form.price} onChange={e => setForm(p => ({...p,price:e.target.value}))} placeholder="0" /></div>
              <div className="space-y-2"><Label>Giá gốc</Label><Input type="number" value={form.originalPrice} onChange={e => setForm(p => ({...p,originalPrice:e.target.value}))} placeholder="0" /></div>
              <div className="space-y-2"><Label>Tồn kho</Label><Input type="number" value={form.stock} onChange={e => setForm(p => ({...p,stock:e.target.value}))} placeholder="0" /></div>
            </div>
            <div className="space-y-2"><Label>Mô tả</Label><Textarea value={form.description} onChange={e => setForm(p => ({...p,description:e.target.value}))} rows={3} /></div>
            <div className="space-y-2"><Label>Hình ảnh (URL)</Label><Input value={form.imageUrl} onChange={e => setForm(p => ({...p,imageUrl:e.target.value}))} placeholder="https://..." /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}><X className="h-4 w-4 mr-1" />Hủy</Button>
              <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Lưu sản phẩm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
