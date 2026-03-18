import { useState, useEffect } from 'react';
import { Search, Lock, Unlock, Users, ShieldAlert, UserCog, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { userApi, type User } from '@/lib/api-service';
import { toast } from 'sonner';

const roleLabels: Record<string, string> = { admin: 'Quản trị viên', staff: 'Nhân viên', customer: 'Khách hàng' };

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getAllUsers({ q: searchQuery || undefined, role: roleFilter !== 'all' ? roleFilter : undefined });
      setUsers(data);
    } catch { toast.error('Không tải được danh sách người dùng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleLockToggle = async (user: User) => {
    const newStatus = user.status === 'active' ? 'locked' : 'active';
    try {
      await userApi.setUserStatus(user.id, newStatus);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      toast.success(newStatus === 'locked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
    } catch { toast.error('Lỗi cập nhật trạng thái'); }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await userApi.setUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: role as User['role'] } : u));
      toast.success('Đã cập nhật vai trò');
    } catch { toast.error('Lỗi cập nhật vai trò'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Quản lý người dùng</h2>
        <p className="text-sm text-muted-foreground">{users.length} người dùng</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm theo tên, email..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchUsers()}
            className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Vai trò" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="admin">Quản trị viên</SelectItem>
            <SelectItem value="staff">Nhân viên</SelectItem>
            <SelectItem value="customer">Khách hàng</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchUsers}>Tìm</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tổng', count: users.length, icon: <Users className="h-6 w-6 text-primary mx-auto" /> },
          { label: 'Admin', count: users.filter(u => u.role === 'admin').length, icon: <ShieldAlert className="h-6 w-6 text-primary mx-auto" /> },
          { label: 'Nhân viên', count: users.filter(u => u.role === 'staff').length, icon: <UserCog className="h-6 w-6 text-primary mx-auto" /> },
          { label: 'Khách hàng', count: users.filter(u => u.role === 'customer').length, icon: <ShoppingCart className="h-6 w-6 text-primary mx-auto" /> },
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

      <Card>
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead><TableHead>Email</TableHead><TableHead>Điện thoại</TableHead>
                  <TableHead className="text-center">Vai trò</TableHead><TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Ngày tạo</TableHead><TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=32`} alt={user.name} className="w-8 h-8 rounded-full" />
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell className="text-sm">{user.phone || '—'}</TableCell>
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
                        <Select defaultValue={user.role} onValueChange={v => handleRoleChange(user.id, v)}>
                          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="staff">Nhân viên</SelectItem>
                            <SelectItem value="customer">Khách hàng</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost" size="icon"
                          className={`h-8 w-8 ${user.status === 'active' ? 'text-red-500' : 'text-green-500'}`}
                          onClick={() => handleLockToggle(user)}
                        >
                          {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && !loading && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Không có người dùng nào</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
