import { useState } from 'react';
import { Search, Lock, Unlock, Users, ShieldAlert, UserCog, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockUsers } from '@/lib/mock-data';
import { toast } from 'sonner';

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = mockUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleLabels: Record<string, string> = {
    admin: 'Quản trị viên',
    staff: 'Nhân viên',
    customer: 'Khách hàng',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Quản lý người dùng</h2>
          <p className="text-sm text-muted-foreground">{mockUsers.length} người dùng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm theo tên, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="admin">Quản trị viên</SelectItem>
            <SelectItem value="staff">Nhân viên</SelectItem>
            <SelectItem value="customer">Khách hàng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tổng', count: mockUsers.length, icon: <Users className="h-6 w-6 text-primary mx-auto" /> },
          { label: 'Admin', count: mockUsers.filter(u => u.role === 'admin').length, icon: <ShieldAlert className="h-6 w-6 text-primary mx-auto" /> },
          { label: 'Nhân viên', count: mockUsers.filter(u => u.role === 'staff').length, icon: <UserCog className="h-6 w-6 text-primary mx-auto" /> },
          { label: 'Khách hàng', count: mockUsers.filter(u => u.role === 'customer').length, icon: <ShoppingCart className="h-6 w-6 text-primary mx-auto" /> },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className="mb-2 flex justify-center">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Điện thoại</TableHead>
                <TableHead className="text-center">Vai trò</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                      <span className="font-medium text-sm">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="text-sm">{user.phone}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={user.role === 'admin' ? 'default' : user.role === 'staff' ? 'secondary' : 'outline'}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Select defaultValue={user.role}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="staff">Nhân viên</SelectItem>
                          <SelectItem value="customer">Khách hàng</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${user.status === 'active' ? 'text-red-500' : 'text-green-500'}`}
                        onClick={() => toast.success(user.status === 'active' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản')}
                      >
                        {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </Button>
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
