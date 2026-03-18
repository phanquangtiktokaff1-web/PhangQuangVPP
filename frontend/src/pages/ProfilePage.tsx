import { useState } from 'react';
import { User, Mail, Phone, Lock, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, updateProfile, changePassword, addAddress, deleteAddress, setDefaultAddress } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Address form
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrWard, setAddrWard] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [showAddressDialog, setShowAddressDialog] = useState(false);

  if (!user) return <div className="container mx-auto px-4 py-8">Vui lòng đăng nhập</div>;

  const handleUpdateProfile = () => {
    updateProfile({ name, phone });
    toast.success('Cập nhật thông tin thành công!');
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    const success = await changePassword(oldPassword, newPassword);
    if (success) {
      toast.success('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleAddAddress = () => {
    if (!addrName || !addrPhone || !addrStreet || !addrCity) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    addAddress({
      name: addrName,
      phone: addrPhone,
      street: addrStreet,
      ward: addrWard,
      district: addrDistrict,
      city: addrCity,
      isDefault: user.addresses.length === 0,
    });
    toast.success('Thêm địa chỉ thành công!');
    setShowAddressDialog(false);
    setAddrName(''); setAddrPhone(''); setAddrStreet(''); setAddrWard(''); setAddrDistrict(''); setAddrCity('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tài khoản của tôi</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="addresses">Địa chỉ</TabsTrigger>
          <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full" />
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {user.role === 'admin' ? 'Quản trị viên' : user.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={user.email} disabled className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" />
                  </div>
                </div>
              </div>

              <Button onClick={handleUpdateProfile} className="gap-2">
                <Save className="h-4 w-4" /> Lưu thay đổi
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Địa chỉ giao hàng</CardTitle>
              <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Thêm địa chỉ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm địa chỉ mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Họ tên</Label>
                        <Input value={addrName} onChange={(e) => setAddrName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Địa chỉ</Label>
                      <Input value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} placeholder="Số nhà, tên đường" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Phường/Xã</Label>
                        <Input value={addrWard} onChange={(e) => setAddrWard(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Quận/Huyện</Label>
                        <Input value={addrDistrict} onChange={(e) => setAddrDistrict(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Tỉnh/Thành phố</Label>
                        <Input value={addrCity} onChange={(e) => setAddrCity(e.target.value)} />
                      </div>
                    </div>
                    <Button onClick={handleAddAddress} className="w-full">Thêm địa chỉ</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {user.addresses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Chưa có địa chỉ nào</p>
              ) : (
                <div className="space-y-4">
                  {user.addresses.map((addr) => (
                    <div key={addr.id} className="border rounded-lg p-4 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{addr.name}</span>
                          <span className="text-muted-foreground">|</span>
                          <span className="text-sm text-muted-foreground">{addr.phone}</span>
                          {addr.isDefault && <Badge variant="secondary" className="text-xs">Mặc định</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!addr.isDefault && (
                          <Button variant="ghost" size="sm" onClick={() => { setDefaultAddress(addr.id); toast.success('Đã đặt làm mặc định'); }}>
                            Đặt mặc định
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { deleteAddress(addr.id); toast.success('Đã xóa địa chỉ'); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Mật khẩu hiện tại</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Button onClick={handleChangePassword}>Đổi mật khẩu</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
