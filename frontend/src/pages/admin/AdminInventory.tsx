import { useState } from 'react';
import { AlertTriangle, Search, Edit, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { products, categories, formatPrice } from '@/lib/mock-data';
import { toast } from 'sonner';

export function AdminInventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const sortedProducts = [...products].sort((a, b) => a.stock - b.stock);
  const lowStockProducts = sortedProducts.filter(p => p.stock > 0 && p.stock < 100);
  const outOfStockProducts = sortedProducts.filter(p => p.stock === 0);

  const filteredProducts = sortedProducts.filter(p => {
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
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('all')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="text-sm text-muted-foreground">Tổng sản phẩm</div>
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:shadow-md ${filter === 'low' ? 'ring-2 ring-orange-500' : ''}`} onClick={() => setFilter('low')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
              <div className="text-sm text-muted-foreground">Sắp hết hàng (&lt;100)</div>
            </div>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer hover:shadow-md ${filter === 'out' ? 'ring-2 ring-red-500' : ''}`} onClick={() => setFilter('out')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
              <div className="text-sm text-muted-foreground">Hết hàng</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low stock alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" /> Cảnh báo sắp hết hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map(p => (
                <Badge key={p.id} variant="outline" className="border-orange-300 text-orange-800">
                  {p.name}: còn {p.stock}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm sản phẩm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Inventory table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-center">Tồn kho</TableHead>
                <TableHead className="text-center">Đã bán</TableHead>
                <TableHead className="text-center">Mức tồn</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => {
                const category = categories.find(c => c.id === product.categoryId);
                const stockLevel = product.stock === 0 ? 0 : product.stock < 50 ? 25 : product.stock < 100 ? 50 : product.stock < 300 ? 75 : 100;
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
                      <span className={product.stock < 100 ? 'text-orange-600' : product.stock === 0 ? 'text-red-600' : ''}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{product.sold}</TableCell>
                    <TableCell>
                      <div className="w-24 mx-auto">
                        <Progress
                          value={stockLevel}
                          className={`h-2 ${stockLevel < 25 ? '[&>div]:bg-red-500' : stockLevel < 50 ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.stock === 0 ? 'destructive' : product.stock < 100 ? 'secondary' : 'default'}>
                        {product.stock === 0 ? 'Hết hàng' : product.stock < 100 ? 'Sắp hết' : 'Còn hàng'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Edit className="h-3 w-3" /> Cập nhật
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cập nhật tồn kho - {product.name}</DialogTitle>
                          </DialogHeader>
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
                              <Input type="number" defaultValue={product.stock} />
                            </div>
                            <div className="space-y-2">
                              <Label>Ghi chú</Label>
                              <Input placeholder="Lý do cập nhật..." />
                            </div>
                            <Button className="w-full" onClick={() => toast.success('Đã cập nhật tồn kho!')}>
                              Cập nhật
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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
