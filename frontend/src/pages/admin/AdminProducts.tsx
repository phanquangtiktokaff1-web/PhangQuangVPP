import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, Loader2, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { catalogApi, formatPrice, normalizeCustomizationOptions, type Product, type Category, type Brand } from '@/lib/api-service';
import { toast } from 'sonner';

const emptyForm = {
  name: '', categoryId: '', brandId: '',
  price: '', originalPrice: '', stock: '',
  description: '', isCustomizable: false,
  colors: '',
};

type FormState = typeof emptyForm;
type ImgObj = { id: string; url: string; alt: string };
type WholesaleRow = { id: string; minQty: string; price: string };
type SpecRow = { id: string; key: string; value: string };
type CustomizationRow = {
  id: string;
  label: string;
  inputType: 'text' | 'image';
  extraPrice: string;
  description: string;
};

function toCustomizationKey(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function ImageUploader({ images, onChange }: { images: ImgObj[]; onChange: (imgs: ImgObj[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const url = ev.target?.result as string;
        onChange([...images, { id: `img-${Date.now()}`, url, alt: file.name }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative group w-20 h-20 rounded-lg border overflow-hidden">
            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            <button
              type="button"
              className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
              onClick={() => remove(idx)}
            >
              <X className="h-4 w-4" />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[9px] text-center py-0.5">Ảnh chính</span>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors gap-1"
        >
          <Upload className="h-5 w-5" />
          <span className="text-[10px]">Tải ảnh</span>
        </button>
      </div>
      <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFile} />
      <p className="text-xs text-muted-foreground">Ảnh đầu tiên sẽ được dùng làm ảnh chính của sản phẩm.</p>
    </div>
  );
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [images, setImages] = useState<ImgObj[]>([]);
  const [wholesaleRows, setWholesaleRows] = useState<WholesaleRow[]>([]);
  const [specRows, setSpecRows] = useState<SpecRow[]>([]);
  const [customizationRows, setCustomizationRows] = useState<CustomizationRow[]>([]);
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const f = (field: keyof FormState, value: string | boolean) => setForm(p => ({ ...p, [field]: value }));

  const fetchProducts = async (params: Record<string, string> = {}) => {
    setLoading(true);
    try {
      const data = await catalogApi.getProducts(params);
      setProducts(data);
    } catch {
      toast.error('Không tải được danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([catalogApi.getCategories(), catalogApi.getBrands()]).then(([cats, brs]) => {
      setCategories(cats);
      setBrands(brs);
    });
    void fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const params: Record<string, string> = {};
      if (searchQuery) params.q = searchQuery;
      if (categoryFilter !== 'all') params.categoryId = categoryFilter;
      void fetchProducts(params);
    }, 300);
  }, [searchQuery, categoryFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setWholesaleRows([]);
    setSpecRows([]);
    setCustomizationRows([]);
    setShowDialog(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      categoryId: p.categoryId,
      brandId: p.brandId,
      price: String(p.price),
      originalPrice: String(p.originalPrice),
      stock: String(p.stock),
      description: p.description,
      isCustomizable: p.isCustomizable,
      colors: p.colors.join(', '),
    });

    setImages(p.images.map(img => ({ id: img.id, url: img.url, alt: img.alt })));
    setWholesaleRows((p.wholesalePrice ?? []).map((wp, idx) => ({ id: `ws-${idx}-${Date.now()}`, minQty: String(wp.minQty), price: String(wp.price) })));
    setSpecRows(Object.entries(p.specifications ?? {}).map(([key, value], idx) => ({ id: `sp-${idx}-${Date.now()}`, key, value: String(value) })));

    const opts = normalizeCustomizationOptions(p.customizationOptions);
    setCustomizationRows(opts.map((opt, idx) => ({
      id: `co-${idx}-${Date.now()}`,
      label: opt.label,
      inputType: opt.inputType || 'text',
      extraPrice: String(opt.extraPrice || 0),
      description: opt.helpText || '',
    })));

    setShowDialog(true);
  };

  const addSpecRow = () => setSpecRows(prev => [...prev, { id: `sp-${Date.now()}`, key: '', value: '' }]);
  const removeSpecRow = (id: string) => setSpecRows(prev => prev.filter(r => r.id !== id));
  const updateSpecRow = (id: string, field: 'key' | 'value', value: string) => {
    setSpecRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addWholesaleRow = () => setWholesaleRows(prev => [...prev, { id: `ws-${Date.now()}`, minQty: '', price: '' }]);
  const removeWholesaleRow = (id: string) => setWholesaleRows(prev => prev.filter(r => r.id !== id));
  const updateWholesaleRow = (id: string, field: 'minQty' | 'price', value: string) => {
    setWholesaleRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addCustomizationRow = () => {
    setCustomizationRows(prev => [...prev, { id: `co-${Date.now()}`, label: '', inputType: 'text', extraPrice: '0', description: '' }]);
  };
  const removeCustomizationRow = (id: string) => setCustomizationRows(prev => prev.filter(r => r.id !== id));
  const updateCustomizationRow = (id: string, field: 'label' | 'inputType' | 'extraPrice' | 'description', value: string) => {
    setCustomizationRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Vui lòng điền tên và giá sản phẩm');
      return;
    }

    setSaving(true);
    try {
      const specs = specRows
        .map(r => ({ key: r.key.trim(), value: r.value.trim() }))
        .filter(r => r.key || r.value);
      if (specs.some(r => !r.key || !r.value)) {
        toast.error('Thông số kỹ thuật chưa hợp lệ. Vui lòng nhập đủ tên và giá trị.');
        setSaving(false);
        return;
      }
      const specifications = specs.reduce<Record<string, string>>((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});

      const wholesale = wholesaleRows
        .map(r => ({ minQty: r.minQty.trim(), price: r.price.trim() }))
        .filter(r => r.minQty || r.price);
      if (wholesale.some(r => !r.minQty || !r.price || Number(r.minQty) <= 0 || Number(r.price) <= 0)) {
        toast.error('Giá sỉ không hợp lệ.');
        setSaving(false);
        return;
      }
      const wholesalePrice = wholesale
        .map(r => ({ minQty: Number(r.minQty), price: Number(r.price) }))
        .sort((a, b) => a.minQty - b.minQty);

      const customRows = customizationRows
        .map(r => ({
          label: r.label.trim(),
          inputType: r.inputType,
          extraPrice: r.extraPrice.trim(),
          description: r.description.trim(),
        }))
        .filter(r => r.label || r.description || r.extraPrice !== '0');

      if (customRows.some(r => !r.label || !Number.isFinite(Number(r.extraPrice)) || Number(r.extraPrice) < 0)) {
        toast.error('Tùy chỉnh chưa hợp lệ. Mỗi dòng cần có tên và phụ phí hợp lệ.');
        setSaving(false);
        return;
      }

      const keyCounter: Record<string, number> = {};
      const customizationOptions = customRows.map((row, index) => {
        const base = toCustomizationKey(row.label) || `custom-${index + 1}`;
        const count = (keyCounter[base] || 0) + 1;
        keyCounter[base] = count;
        return {
          key: count > 1 ? `${base}-${count}` : base,
          label: row.label,
          inputType: row.inputType,
          extraPrice: Number(row.extraPrice || 0),
          helpText: row.description || undefined,
          placeholder: row.inputType === 'image' ? 'Tải ảnh thiết kế để in' : 'Nhập nội dung tùy chỉnh...',
        };
      });

      const payload: Record<string, unknown> = {
        name: form.name,
        categoryId: form.categoryId,
        brandId: form.brandId,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice) || Number(form.price),
        stock: Number(form.stock) || 0,
        description: form.description,
        specifications,
        isCustomizable: form.isCustomizable,
        customizationOptions: form.isCustomizable ? customizationOptions : [],
        wholesalePrice,
        colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        images,
      };

      if (editing) {
        await catalogApi.updateProduct(editing.id, payload);
        toast.success('Đã cập nhật sản phẩm!');
      } else {
        await catalogApi.createProduct(payload);
        toast.success('Đã thêm sản phẩm!');
      }

      setShowDialog(false);
      void fetchProducts();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Lỗi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await catalogApi.deleteProduct(id);
      toast.success('Đã xóa sản phẩm');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      toast.error('Lỗi xóa sản phẩm');
    }
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
          <Input placeholder="Tìm theo tên..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
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
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead className="text-center">Tồn kho</TableHead>
                  <TableHead className="text-center">Đã bán</TableHead>
                  <TableHead className="text-center">Thuộc tính</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
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
                          <img src={product.images[0]?.url} alt={product.name} className="w-10 h-10 rounded object-cover bg-muted" />
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{brands.find(b => b.id === product.brandId)?.name}</div>
                          </div>
                        </div>
                      </TableCell>
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
                        <div className="flex gap-1 justify-center">
                          {product.isCustomizable && <Badge variant="secondary" className="text-xs">Tùy chỉnh</Badge>}
                          {product.wholesalePrice && product.wholesalePrice.length > 0 && <Badge variant="secondary" className="text-xs">Sỉ</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => void handleDelete(product.id, product.name)}><Trash2 className="h-4 w-4" /></Button>
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="!w-[96vw] !max-w-[96vw] 2xl:!max-w-[1400px] max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tên sản phẩm *</Label>
                  <Input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Nhập tên sản phẩm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Danh mục</Label>
                    <Select value={form.categoryId} onValueChange={v => f('categoryId', v)}>
                      <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Thương hiệu</Label>
                    <Select value={form.brandId} onValueChange={v => f('brandId', v)}>
                      <SelectTrigger><SelectValue placeholder="Chọn thương hiệu" /></SelectTrigger>
                      <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Giá bán *</Label><Input type="number" value={form.price} onChange={e => f('price', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Giá gốc</Label><Input type="number" value={form.originalPrice} onChange={e => f('originalPrice', e.target.value)} /></div>
                  <div className="space-y-2"><Label>Tồn kho</Label><Input type="number" value={form.stock} onChange={e => f('stock', e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Màu sắc (phân cách bằng dấu phẩy)</Label><Input value={form.colors} onChange={e => f('colors', e.target.value)} /></div>
                <div className="space-y-2"><Label>Mô tả</Label><Textarea value={form.description} onChange={e => f('description', e.target.value)} rows={4} /></div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Hình ảnh sản phẩm</Label>
                  <ImageUploader images={images} onChange={setImages} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Thông số kỹ thuật</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSpecRow}><Plus className="h-4 w-4 mr-1" /> Thêm thông số</Button>
                  </div>
                  {specRows.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Chưa có thông số.</p>
                  ) : (
                    <div className="space-y-2">
                      {specRows.map(row => (
                        <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                          <Input placeholder="Tên thông số" value={row.key} onChange={e => updateSpecRow(row.id, 'key', e.target.value)} />
                          <Input placeholder="Giá trị" value={row.value} onChange={e => updateSpecRow(row.id, 'value', e.target.value)} />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeSpecRow(row.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Switch checked={form.isCustomizable} onCheckedChange={v => f('isCustomizable', v)} id="customizable" />
                <Label htmlFor="customizable" className="cursor-pointer">
                  <div className="font-medium text-sm">Có thể tùy chỉnh</div>
                  <div className="text-xs text-muted-foreground">Thêm tùy chỉnh dạng dòng giống giá sỉ.</div>
                </Label>
              </div>
            </div>

            {form.isCustomizable && (
              <div className="space-y-2 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label>Khả năng tùy chỉnh</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCustomizationRow}><Plus className="h-4 w-4 mr-1" /> Thêm tùy chỉnh</Button>
                </div>

                {customizationRows.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Mỗi tùy chỉnh gồm: Tên, Kiểu nhận dữ liệu (chữ/ảnh), Phụ phí, Mô tả.</p>
                ) : (
                  <div className="space-y-2">
                    {customizationRows.map(row => (
                      <div key={row.id} className="grid md:grid-cols-[1.2fr_0.9fr_0.9fr_1.5fr_auto] gap-2 items-center border rounded-md p-2">
                        <Input placeholder="Tên tùy chỉnh *" value={row.label} onChange={e => updateCustomizationRow(row.id, 'label', e.target.value)} />
                        <Select value={row.inputType} onValueChange={(v) => updateCustomizationRow(row.id, 'inputType', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Chữ</SelectItem>
                            <SelectItem value="image">Ảnh</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input type="number" min={0} placeholder="Phụ phí" value={row.extraPrice} onChange={e => updateCustomizationRow(row.id, 'extraPrice', e.target.value)} />
                        <Input placeholder="Mô tả kiểu tùy chỉnh" value={row.description} onChange={e => updateCustomizationRow(row.id, 'description', e.target.value)} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomizationRow(row.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    ))}
                  </div>
                )}

                {customizationRows.length > 0 && (
                  <div className="mt-3 border-t pt-3 space-y-2">
                    <Label className="text-sm">Xem trước cho khách hàng</Label>
                    <div className="space-y-2">
                      {customizationRows.map(row => (
                        <div key={`preview-${row.id}`} className="rounded-md border bg-muted/20 p-2 text-sm">
                          <div className="font-medium">{row.label || 'Chưa nhập tên tùy chỉnh'}</div>
                          <div className="text-xs text-muted-foreground">Kiểu nhận dữ liệu: {row.inputType === 'image' ? 'Ảnh' : 'Chữ'}</div>
                          <div className="text-xs text-muted-foreground">Phụ phí: {formatPrice(Number(row.extraPrice || 0))}</div>
                          {row.description && <div className="text-xs text-muted-foreground">Mô tả: {row.description}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Giá sỉ</Label>
                <Button type="button" variant="outline" size="sm" onClick={addWholesaleRow}><Plus className="h-4 w-4 mr-1" /> Thêm mốc giá</Button>
              </div>
              {wholesaleRows.length === 0 ? (
                <p className="text-xs text-muted-foreground">Chưa có giá sỉ.</p>
              ) : (
                <div className="space-y-2">
                  {wholesaleRows.map(row => (
                    <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input type="number" min={1} placeholder="SL tối thiểu" value={row.minQty} onChange={e => updateWholesaleRow(row.id, 'minQty', e.target.value)} />
                      <Input type="number" min={1} placeholder="Đơn giá" value={row.price} onChange={e => updateWholesaleRow(row.id, 'price', e.target.value)} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeWholesaleRow(row.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}><X className="h-4 w-4 mr-1" />Hủy</Button>
              <Button onClick={() => void handleSave()} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Lưu sản phẩm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
