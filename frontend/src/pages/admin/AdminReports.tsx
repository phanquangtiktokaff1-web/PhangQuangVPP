import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDashboardStats, formatPrice, products, mockUsers } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area } from 'recharts';

export function AdminReports() {
  const stats = getDashboardStats();

  const categoryRevenue = [
    { name: 'Bút viết', revenue: 8500000, orders: 45 },
    { name: 'Giấy & Sổ', revenue: 12300000, orders: 38 },
    { name: 'Kẹp & Ghim', revenue: 3200000, orders: 22 },
    { name: 'Hồ sơ & Bìa', revenue: 4500000, orders: 18 },
    { name: 'Băng keo', revenue: 2800000, orders: 15 },
    { name: 'Dụng cụ VP', revenue: 5600000, orders: 25 },
    { name: 'Mực in', revenue: 9800000, orders: 12 },
    { name: 'Phụ kiện bàn', revenue: 6200000, orders: 20 },
  ];

  const customerGrowth = [
    { month: 'T1', newCustomers: 15, totalCustomers: 120 },
    { month: 'T2', newCustomers: 22, totalCustomers: 142 },
    { month: 'T3', newCustomers: 18, totalCustomers: 160 },
    { month: 'T4', newCustomers: 25, totalCustomers: 185 },
    { month: 'T5', newCustomers: 30, totalCustomers: 215 },
    { month: 'T6', newCustomers: 28, totalCustomers: 243 },
    { month: 'T7', newCustomers: 35, totalCustomers: 278 },
    { month: 'T8', newCustomers: 20, totalCustomers: 298 },
    { month: 'T9', newCustomers: 32, totalCustomers: 330 },
    { month: 'T10', newCustomers: 27, totalCustomers: 357 },
    { month: 'T11', newCustomers: 38, totalCustomers: 395 },
    { month: 'T12', newCustomers: 42, totalCustomers: 437 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Báo cáo & Thống kê</h2>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
          <TabsTrigger value="returns">Hoàn hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6 mt-4">
          {/* Revenue summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground">Doanh thu năm</div>
                <div className="text-2xl font-bold text-green-600">{formatPrice(241600000)}</div>
                <div className="text-xs text-green-600">+18.5% so với năm trước</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground">Doanh thu tháng</div>
                <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
                <div className="text-xs text-green-600">+12.5% so với tháng trước</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground">Giá trị đơn TB</div>
                <div className="text-2xl font-bold">{formatPrice(280000)}</div>
                <div className="text-xs text-muted-foreground">Trên {stats.totalOrders} đơn hàng</div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue chart */}
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo tháng (2024)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={stats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value) => formatPrice(value as number)} />
                  <Area type="monotone" dataKey="revenue" stroke="#0077B6" fill="#0077B680" name="Doanh thu" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by category */}
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => formatPrice(value as number)} />
                  <Bar dataKey="revenue" fill="#0096C7" radius={[0, 4, 4, 0]} name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top sản phẩm bán chạy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topProducts.map((product, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-gray-100 text-gray-700' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.sold} đã bán</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatPrice(product.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                  <div className="text-sm text-muted-foreground">Tổng sản phẩm</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{products.filter(p => p.status === 'active').length}</div>
                  <div className="text-sm text-muted-foreground">Đang bán</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{products.filter(p => p.stock < 100).length}</div>
                  <div className="text-sm text-muted-foreground">Sắp hết hàng</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{products.filter(p => p.isFlashSale).length}</div>
                  <div className="text-sm text-muted-foreground">Flash Sale</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tăng trưởng khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="newCustomers" stroke="#00B4D8" strokeWidth={2} name="Khách mới" />
                  <Line type="monotone" dataKey="totalCustomers" stroke="#023E8A" strokeWidth={2} name="Tổng khách" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{mockUsers.filter(u => u.role === 'customer').length}</div>
                <div className="text-sm text-muted-foreground">Tổng khách hàng</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-muted-foreground">Khách mới tháng này</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">68%</div>
                <div className="text-sm text-muted-foreground">Tỷ lệ quay lại</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="returns" className="space-y-6 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{stats.returnRate}%</div>
                <div className="text-sm text-muted-foreground">Tỷ lệ hoàn hàng</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="text-sm text-muted-foreground">Yêu cầu hoàn đang xử lý</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-muted-foreground">Tỷ lệ hài lòng</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lý do hoàn hàng phổ biến</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { reason: 'Sản phẩm bị lỗi', count: 5, percent: 35 },
                  { reason: 'Không đúng mô tả', count: 3, percent: 21 },
                  { reason: 'Giao sai sản phẩm', count: 3, percent: 21 },
                  { reason: 'Đổi ý', count: 2, percent: 14 },
                  { reason: 'Khác', count: 1, percent: 7 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.reason}</span>
                        <span className="text-muted-foreground">{item.count} ({item.percent}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
