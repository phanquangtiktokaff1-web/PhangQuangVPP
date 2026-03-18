import { useState, useEffect } from 'react';
import { AlertTriangle, Search, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { catalogApi, type Product, type Category } from '@/lib/api-service';
import { toast } from 'sonner';

export function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [newStock, setNewStock] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([catalogApi.getProducts(), catalogApi.getCategories()]);
      setProducts(prods.sort((a, b) => a.stock - b.stock));
      setCategories(cats);
    } catch { toast.error('Không tải được dữ liệu kho'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleUpdateStock = async (productId: string) => {
    const stock = Number(newStock[productId]);
    if (isNaN(stock) || stock < 0) { toast.error('Số lượng không hợp lệ'); return; }
    setUpdating(productId);
    try {
      await catalogApi.updateStock(productId, stock);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock } : p));
      toast.success('Đã cập nhật tồn kho!');
    } catch { toast.error('Lỗi cập nhật tồn kho'); }
    finally { setUpdating(null); }
  };

  const lowStock = products.filter(p => p.stock > 0 && p.stock < 100);
  const outOfStock = products.filter(p => p.stock === 0);
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'low') return matchSearch && p.stock > 0 && p.stock < 100;
    if (filter === 'out') return matchSearch && p.stock === 0;
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Quản lý kho hàng</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tổng sản phẩm', count: products.length, icon: Package, color: 'blue', filterKey: 'all' as const },
          { label: 'Sắp hết hàng (<100)', count: lowStock.length, icon: AlertTriangle, color: 'orange', filterKey: 'low' as const },
          { label: 'Hết hàng', count: outOfStock.length, icon: AlertTriangle, color: 'red', filterKey: 'out' as const },
        ].map((s) => (
          <Card key={s.filterKey} className={`cursor-pointer hover:shadow-md ${filter === s.filterKey ? `ring-2 ring-${s.color}-500` : ''}`} onClick={() => setFilter(s.filterKey)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`bg-${s.color}-100 p-3 rounded-full`}><s.icon className={`h-5 w-5 text-${s.color}-600`} /></div>
              <div>
                <div className={`text-2xl font-bold ${s.color !== 'blue' ? `text-${s.color}-600` : ''}`}>{s.count}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {lowStock.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2"><CardTitle className="text-base text-orange-800 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Cảnh báo sắp hết hàng</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStock.map(p => <Badge key={p.id} variant="outline" className="border-orange-300 text-orange-800">{p.name}: còn {p.stock}</Badge>)}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm sản phẩm..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead><TableHead>Danh mục</TableHead>
                  <TableHead className="text-center">Tồn kho</TableHead><TableHead className="text-center">Đã bán</TableHead>
                  <TableHead className="text-center">Mức tồn</TableHead><TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(product => {
                  const category = categories.find(c => c.id === product.categoryId);
                  const lvl = product.stock === 0 ? 0 : product.stock < 50 ? 25 : product.stock < 100 ? 50 : product.stock < 300 ? 75 : 100;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={product.images[0]?.url} alt="" className="w-10 h-10 rounded object-cover" />
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.sku}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{category?.name}</Badge></TableCell>
                      <TableCell className="text-center font-medium">
                        <span className={product.stock === 0 ? 'text-red-600' : product.stock < 100 ? 'text-orange-600' : ''}>{product.stock}</span>
                      </TableCell>
                      <TableCell className="text-center">{product.sold}</TableCell>
                      <TableCell><div className="w-24 mx-auto"><Progress value={lvl} className="h-2" /></div></TableCell>
                      <TableCell className="text-center">
                        <Badge variant={product.stock === 0 ? 'destructive' : product.stock < 100 ? 'secondary' : 'default'}>
                          {product.stock === 0 ? 'Hết hàng' : product.stock < 100 ? 'Sắp hết' : 'Còn hàng'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild><Button variant="ghost" size="sm" className="gap-1">Cập nhật</Button></DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Cập nhật tồn kho - {product.name}</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <img src={product.images[0]?.url} alt="" className="w-16 h-16 rounded object-cover" />
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                                  <div className="text-sm">Tồn kho hiện tại: <span className="font-bold">{product.stock}</span></div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Số lượng mới</Label>
                                <Input type="number" defaultValue={product.stock} onChange={e => setNewStock(p => ({...p,[product.id]:e.target.value}))} />
                              </div>
                              <Button className="w-full" onClick={() => handleUpdateStock(product.id)} disabled={updating === product.id}>
                                {updating === product.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Cập nhật
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && !loading && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Không có sản phẩm nào</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
