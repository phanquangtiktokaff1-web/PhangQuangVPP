import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cart-store';

export function PaymentVNPayReturnPage() {
  const location = useLocation();
  const clearCart = useCartStore(s => s.clearCart);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('Đang xác thực kết quả thanh toán VNPay...');

  const queryObject = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        const { data } = await api.get('/orders/vnpay-verify', { params: queryObject });
        if (cancelled) return;

        setSuccess(true);
        setOrderId(String(data?.orderId || queryObject.vnp_TxnRef || ''));
        setMessage('Thanh toán VNPay thành công!');
        clearCart();
      } catch (error: unknown) {
        if (cancelled) return;

        const response = (error as { response?: { data?: { message?: string; orderId?: string } } })?.response?.data;
        setSuccess(false);
        setOrderId(String(response?.orderId || queryObject.vnp_TxnRef || ''));
        setMessage(response?.message || 'Thanh toán chưa thành công hoặc dữ liệu không hợp lệ.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [clearCart, queryObject]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Đang xử lý thanh toán</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg">
      {success ? (
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
      ) : (
        <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
      )}
      <h1 className="text-2xl font-bold mb-2">
        {success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
      </h1>
      <p className="text-muted-foreground mb-2">{message}</p>
      {orderId && (
        <p className="text-muted-foreground mb-6">
          Mã đơn hàng: <span className="font-bold text-foreground">{orderId}</span>
        </p>
      )}
      <div className="flex gap-3 justify-center">
        <Link to="/orders"><Button>Xem đơn hàng</Button></Link>
        <Link to="/"><Button variant="outline">Về trang chủ</Button></Link>
      </div>
    </div>
  );
}
