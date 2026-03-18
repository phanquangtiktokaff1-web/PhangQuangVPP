import { Link } from 'react-router';
import { Phone, Mail, MapPin, Facebook, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="QuangVPP logo" className="h-10 w-10 rounded-lg object-cover" />
              <div>
                <div className="font-bold text-lg text-white">QuangVPP</div>
                <div className="text-xs text-gray-400">Văn phòng phẩm</div>
              </div>
            </div>
            <p className="text-sm mb-4">
              QuangVPP - Cung cấp văn phòng phẩm chất lượng cao với giá cả hợp lý. 
              Phục vụ cá nhân, doanh nghiệp và trường học trên toàn quốc.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1900 1234</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@vpshop.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Về QuangVPP</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors text-gray-300">Giới thiệu</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors text-gray-300">Tuyển dụng</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors text-gray-300">Chính sách bảo mật</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors text-gray-300">Điều khoản sử dụng</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors text-gray-300">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Customer support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors text-gray-300">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors text-gray-300">Chính sách đổi trả</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors text-gray-300">Chính sách vận chuyển</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors text-gray-300">Phương thức thanh toán</Link></li>
              <li><Link to="/wholesale" className="hover:text-white transition-colors text-gray-300">Mua hàng sỉ</Link></li>
            </ul>
          </div>

          {/* Payment & Social */}
          <div>
            <h3 className="font-semibold text-white mb-4">Thanh toán</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="bg-white rounded px-3 py-1 text-xs font-semibold text-gray-800">COD</div>
              <div className="bg-white rounded px-3 py-1 text-xs font-semibold text-gray-800">VNPay</div>
              <div className="bg-white rounded px-3 py-1 text-xs font-semibold text-pink-600">MoMo</div>
              <div className="bg-white rounded px-3 py-1 text-xs font-semibold text-blue-600">ZaloPay</div>
              <div className="bg-white rounded px-3 py-1 text-xs font-semibold text-gray-800">Bank</div>
            </div>

            <h3 className="font-semibold text-white mb-4">Kết nối với chúng tôi</h3>
            <div className="flex gap-3">
              <a href="#" className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors">
                <Facebook className="h-4 w-4 text-white" />
              </a>
              <a href="#" className="bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition-colors">
                <MessageCircle className="h-4 w-4 text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
          © 2024 QuangVPP. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
