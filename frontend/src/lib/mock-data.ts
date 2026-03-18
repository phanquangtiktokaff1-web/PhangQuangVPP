// ==================== TYPES ====================

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  productCount: number;
  image: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  brandId: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: ProductImage[];
  description: string;
  specifications: Record<string, string>;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  colors: string[];
  tags: string[];
  isFlashSale: boolean;
  flashSaleEnd?: string;
  flashSalePrice?: number;
  isCustomizable: boolean;
  customizationOptions?: string[];
  wholesalePrice?: { minQty: number; price: number }[];
  createdAt: string;
  status: 'active' | 'inactive' | 'out_of_stock';
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar: string;
  role: 'customer' | 'admin' | 'staff';
  status: 'active' | 'locked';
  createdAt: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  customization?: {
    type: string;
    text: string;
  };
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  customization?: {
    type: string;
    text: string;
  };
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
export type ShippingMethod = 'standard' | 'express' | 'same_day';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingMethod: ShippingMethod;
  shippingAddress: Address;
  voucherCode?: string;
  note?: string;
  timeline: { status: string; date: string; note?: string }[];
  createdAt: string;
  returnRequest?: {
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  };
}

export interface Voucher {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'disabled';
  description: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'admin';
  message: string;
  timestamp: string;
  isRead: boolean;
}

// ==================== MOCK DATA ====================

export const categories: Category[] = [
  { id: 'cat-1', name: 'Bút viết', slug: 'but-viet', icon: 'PenTool', description: 'Các loại bút bi, bút gel, bút dạ quang', productCount: 45, image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400' },
  { id: 'cat-2', name: 'Giấy & Sổ', slug: 'giay-so', icon: 'BookOpen', description: 'Giấy A4, sổ tay, vở viết', productCount: 32, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400' },
  { id: 'cat-3', name: 'Kẹp & Ghim', slug: 'kep-ghim', icon: 'Paperclip', description: 'Kẹp giấy, ghim bấm, kẹp bướm', productCount: 28, image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400' },
  { id: 'cat-4', name: 'Hồ sơ & Bìa', slug: 'ho-so-bia', icon: 'Folder', description: 'Bìa hồ sơ, file tài liệu, bìa lá', productCount: 22, image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400' },
  { id: 'cat-5', name: 'Băng keo & Keo dán', slug: 'bang-keo', icon: 'Link', description: 'Băng keo trong, keo dán, keo sữa', productCount: 18, image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400' },
  { id: 'cat-6', name: 'Dụng cụ văn phòng', slug: 'dung-cu-van-phong', icon: 'Scissors', description: 'Máy bấm ghim, dao rọc giấy, thước kẻ', productCount: 35, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' },
  { id: 'cat-7', name: 'Mực in & Cartridge', slug: 'muc-in', icon: 'Printer', description: 'Mực in, cartridge, drum', productCount: 15, image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400' },
  { id: 'cat-8', name: 'Phụ kiện bàn làm việc', slug: 'phu-kien-ban', icon: 'Archive', description: 'Khay để tài liệu, hộp bút, lịch bàn', productCount: 20, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400' },
];

export const brands: Brand[] = [
  { id: 'brand-1', name: 'Thiên Long', logo: '/brands/thienlong.png' },
  { id: 'brand-2', name: 'Deli', logo: '/brands/deli.png' },
  { id: 'brand-3', name: 'Plus', logo: '/brands/plus.png' },
  { id: 'brand-4', name: 'Pentel', logo: '/brands/pentel.png' },
  { id: 'brand-5', name: 'Staedtler', logo: '/brands/staedtler.png' },
  { id: 'brand-6', name: 'Double A', logo: '/brands/doublea.png' },
  { id: 'brand-7', name: 'HP', logo: '/brands/hp.png' },
  { id: 'brand-8', name: 'Canon', logo: '/brands/canon.png' },
];

const generateReviews = (count: number): ProductReview[] => {
  const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Đỗ Thị F'];
  const comments = [
    'Sản phẩm rất tốt, đúng mô tả. Giao hàng nhanh!',
    'Chất lượng ổn so với giá tiền. Sẽ mua lại.',
    'Đóng gói cẩn thận, sản phẩm đẹp.',
    'Hơi nhỏ hơn mong đợi nhưng chất lượng tốt.',
    'Rất hài lòng, shop phục vụ tận tình.',
    'Sản phẩm chính hãng, giá cả hợp lý.',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `review-${i}`,
    userId: `user-${i + 1}`,
    userName: names[i % names.length],
    userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    rating: Math.floor(Math.random() * 2) + 4,
    comment: comments[i % comments.length],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    helpful: Math.floor(Math.random() * 20),
  }));
};

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Bút bi Thiên Long TL-027',
    slug: 'but-bi-thien-long-tl-027',
    sku: 'TL-027-BL',
    categoryId: 'cat-1',
    brandId: 'brand-1',
    price: 5000,
    originalPrice: 7000,
    discount: 29,
    images: [
      { id: 'img-1', url: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600', alt: 'Bút bi Thiên Long' },
      { id: 'img-2', url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600', alt: 'Bút bi Thiên Long mặt bên' },
    ],
    description: 'Bút bi Thiên Long TL-027 với thiết kế thân bút trong suốt, mực viết đều và mượt mà. Phù hợp cho học sinh, sinh viên và nhân viên văn phòng.',
    specifications: { 'Màu mực': 'Xanh', 'Đường kính viên bi': '0.5mm', 'Chiều dài': '14cm', 'Chất liệu': 'Nhựa trong suốt', 'Xuất xứ': 'Việt Nam' },
    stock: 500,
    sold: 1250,
    rating: 4.5,
    reviewCount: 89,
    reviews: generateReviews(6),
    colors: ['Xanh', 'Đỏ', 'Đen'],
    tags: ['bút bi', 'thiên long', 'văn phòng phẩm'],
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    flashSalePrice: 3500,
    isCustomizable: true,
    customizationOptions: ['In tên', 'In logo công ty'],
    wholesalePrice: [
      { minQty: 50, price: 4000 },
      { minQty: 100, price: 3500 },
      { minQty: 500, price: 3000 },
    ],
    createdAt: '2024-01-15T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-2',
    name: 'Bút gel Pentel Energel BL77',
    slug: 'but-gel-pentel-energel-bl77',
    sku: 'PTL-BL77',
    categoryId: 'cat-1',
    brandId: 'brand-4',
    price: 35000,
    originalPrice: 42000,
    discount: 17,
    images: [
      { id: 'img-3', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600', alt: 'Bút gel Pentel' },
    ],
    description: 'Bút gel Pentel Energel BL77 với công nghệ mực gel tiên tiến, cho nét viết mượt mà và khô nhanh. Thiết kế tay cầm cao su chống trượt.',
    specifications: { 'Màu mực': 'Đen', 'Đường kính viên bi': '0.7mm', 'Chiều dài': '15cm', 'Chất liệu': 'Nhựa + Cao su', 'Xuất xứ': 'Nhật Bản' },
    stock: 200,
    sold: 856,
    rating: 4.8,
    reviewCount: 156,
    reviews: generateReviews(6),
    colors: ['Đen', 'Xanh', 'Đỏ'],
    tags: ['bút gel', 'pentel', 'cao cấp'],
    isFlashSale: false,
    isCustomizable: true,
    customizationOptions: ['Khắc tên'],
    wholesalePrice: [
      { minQty: 50, price: 30000 },
      { minQty: 100, price: 28000 },
    ],
    createdAt: '2024-02-10T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-3',
    name: 'Giấy A4 Double A 80gsm (500 tờ)',
    slug: 'giay-a4-double-a-80gsm',
    sku: 'DA-A4-80',
    categoryId: 'cat-2',
    brandId: 'brand-6',
    price: 89000,
    originalPrice: 105000,
    discount: 15,
    images: [
      { id: 'img-4', url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600', alt: 'Giấy A4 Double A' },
    ],
    description: 'Giấy A4 Double A 80gsm chất lượng cao, trắng sáng, không kẹt giấy. Phù hợp cho in ấn, photocopy và viết tay.',
    specifications: { 'Kích thước': 'A4 (210x297mm)', 'Định lượng': '80gsm', 'Số tờ': '500 tờ/ram', 'Độ trắng': 'CIE 165', 'Xuất xứ': 'Thái Lan' },
    stock: 1000,
    sold: 3200,
    rating: 4.7,
    reviewCount: 245,
    reviews: generateReviews(6),
    colors: ['Trắng'],
    tags: ['giấy a4', 'double a', 'in ấn'],
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    flashSalePrice: 75000,
    isCustomizable: false,
    wholesalePrice: [
      { minQty: 10, price: 82000 },
      { minQty: 50, price: 78000 },
      { minQty: 100, price: 72000 },
    ],
    createdAt: '2024-01-05T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-4',
    name: 'Sổ tay bìa da A5 Deli',
    slug: 'so-tay-bia-da-a5-deli',
    sku: 'DL-NB-A5',
    categoryId: 'cat-2',
    brandId: 'brand-2',
    price: 65000,
    originalPrice: 85000,
    discount: 24,
    images: [
      { id: 'img-5', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600', alt: 'Sổ tay Deli' },
    ],
    description: 'Sổ tay bìa da cao cấp Deli, kích thước A5, 200 trang giấy trắng ngà. Thiết kế sang trọng, phù hợp làm quà tặng.',
    specifications: { 'Kích thước': 'A5 (148x210mm)', 'Số trang': '200 trang', 'Chất liệu bìa': 'Da PU', 'Loại giấy': 'Giấy trắng ngà 80gsm', 'Xuất xứ': 'Trung Quốc' },
    stock: 150,
    sold: 420,
    rating: 4.3,
    reviewCount: 67,
    reviews: generateReviews(5),
    colors: ['Đen', 'Nâu', 'Xanh navy'],
    tags: ['sổ tay', 'deli', 'bìa da', 'quà tặng'],
    isFlashSale: false,
    isCustomizable: true,
    customizationOptions: ['In tên', 'In logo công ty', 'Ép nhũ vàng'],
    wholesalePrice: [
      { minQty: 20, price: 55000 },
      { minQty: 50, price: 48000 },
      { minQty: 100, price: 42000 },
    ],
    createdAt: '2024-03-01T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-5',
    name: 'Kẹp bướm Deli 25mm (hộp 12 cái)',
    slug: 'kep-buom-deli-25mm',
    sku: 'DL-BC-25',
    categoryId: 'cat-3',
    brandId: 'brand-2',
    price: 15000,
    originalPrice: 18000,
    discount: 17,
    images: [
      { id: 'img-6', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600', alt: 'Kẹp bướm Deli' },
    ],
    description: 'Kẹp bướm Deli 25mm chất liệu thép mạ niken, bền bỉ, kẹp chắc chắn. Hộp 12 cái.',
    specifications: { 'Kích thước': '25mm', 'Số lượng': '12 cái/hộp', 'Chất liệu': 'Thép mạ niken', 'Sức kẹp': '~60 tờ giấy', 'Xuất xứ': 'Trung Quốc' },
    stock: 300,
    sold: 890,
    rating: 4.4,
    reviewCount: 45,
    reviews: generateReviews(4),
    colors: ['Bạc'],
    tags: ['kẹp bướm', 'deli', 'văn phòng'],
    isFlashSale: false,
    isCustomizable: false,
    wholesalePrice: [
      { minQty: 50, price: 12000 },
      { minQty: 100, price: 10000 },
    ],
    createdAt: '2024-02-20T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-6',
    name: 'Bìa hồ sơ Plus A4 (bộ 10)',
    slug: 'bia-ho-so-plus-a4',
    sku: 'PL-FL-A4',
    categoryId: 'cat-4',
    brandId: 'brand-3',
    price: 45000,
    originalPrice: 55000,
    discount: 18,
    images: [
      { id: 'img-7', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600', alt: 'Bìa hồ sơ Plus' },
    ],
    description: 'Bìa hồ sơ Plus A4 chất liệu PP dày dặn, trong suốt, dễ dàng phân loại tài liệu. Bộ 10 bìa nhiều màu.',
    specifications: { 'Kích thước': 'A4', 'Số lượng': '10 bìa/bộ', 'Chất liệu': 'PP', 'Màu sắc': 'Nhiều màu', 'Xuất xứ': 'Nhật Bản' },
    stock: 250,
    sold: 560,
    rating: 4.6,
    reviewCount: 78,
    reviews: generateReviews(5),
    colors: ['Trong suốt', 'Xanh', 'Đỏ', 'Vàng'],
    tags: ['bìa hồ sơ', 'plus', 'tài liệu'],
    isFlashSale: false,
    isCustomizable: false,
    createdAt: '2024-01-25T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-7',
    name: 'Băng keo trong Deli 48mm x 100m',
    slug: 'bang-keo-trong-deli-48mm',
    sku: 'DL-TP-48',
    categoryId: 'cat-5',
    brandId: 'brand-2',
    price: 22000,
    originalPrice: 28000,
    discount: 21,
    images: [
      { id: 'img-8', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600', alt: 'Băng keo Deli' },
    ],
    description: 'Băng keo trong Deli 48mm x 100m, độ dính cao, không để lại vết keo. Phù hợp đóng gói và dán.',
    specifications: { 'Kích thước': '48mm x 100m', 'Chất liệu': 'OPP', 'Độ dày': '45 micron', 'Xuất xứ': 'Trung Quốc' },
    stock: 400,
    sold: 1100,
    rating: 4.2,
    reviewCount: 56,
    reviews: generateReviews(4),
    colors: ['Trong suốt'],
    tags: ['băng keo', 'deli', 'đóng gói'],
    isFlashSale: false,
    isCustomizable: false,
    wholesalePrice: [
      { minQty: 50, price: 18000 },
      { minQty: 100, price: 15000 },
    ],
    createdAt: '2024-02-15T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-8',
    name: 'Máy bấm ghim Deli No.10',
    slug: 'may-bam-ghim-deli-no10',
    sku: 'DL-ST-10',
    categoryId: 'cat-6',
    brandId: 'brand-2',
    price: 35000,
    originalPrice: 45000,
    discount: 22,
    images: [
      { id: 'img-9', url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600', alt: 'Máy bấm ghim Deli' },
    ],
    description: 'Máy bấm ghim Deli No.10 thiết kế nhỏ gọn, bấm nhẹ tay, ghim chắc chắn. Sử dụng ghim No.10.',
    specifications: { 'Loại ghim': 'No.10', 'Sức bấm': '15 tờ', 'Chất liệu': 'Kim loại + Nhựa', 'Kích thước': '10x5x3cm', 'Xuất xứ': 'Trung Quốc' },
    stock: 180,
    sold: 340,
    rating: 4.5,
    reviewCount: 42,
    reviews: generateReviews(4),
    colors: ['Đen', 'Xanh', 'Hồng'],
    tags: ['máy bấm ghim', 'deli', 'dụng cụ'],
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    flashSalePrice: 28000,
    isCustomizable: false,
    createdAt: '2024-03-05T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-9',
    name: 'Mực in HP 680 Black',
    slug: 'muc-in-hp-680-black',
    sku: 'HP-680-BK',
    categoryId: 'cat-7',
    brandId: 'brand-7',
    price: 185000,
    originalPrice: 220000,
    discount: 16,
    images: [
      { id: 'img-10', url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600', alt: 'Mực in HP 680' },
    ],
    description: 'Mực in HP 680 Black chính hãng, cho bản in sắc nét, bền màu. Tương thích với nhiều dòng máy in HP.',
    specifications: { 'Màu': 'Đen', 'Dung lượng': '~480 trang', 'Tương thích': 'HP DeskJet 2135, 2676, 3635...', 'Xuất xứ': 'Malaysia' },
    stock: 80,
    sold: 620,
    rating: 4.6,
    reviewCount: 98,
    reviews: generateReviews(5),
    colors: ['Đen'],
    tags: ['mực in', 'hp', 'cartridge'],
    isFlashSale: false,
    isCustomizable: false,
    wholesalePrice: [
      { minQty: 10, price: 170000 },
      { minQty: 50, price: 155000 },
    ],
    createdAt: '2024-01-20T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-10',
    name: 'Khay để tài liệu 3 tầng Deli',
    slug: 'khay-de-tai-lieu-3-tang-deli',
    sku: 'DL-DT-3T',
    categoryId: 'cat-8',
    brandId: 'brand-2',
    price: 120000,
    originalPrice: 150000,
    discount: 20,
    images: [
      { id: 'img-11', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600', alt: 'Khay tài liệu Deli' },
    ],
    description: 'Khay để tài liệu 3 tầng Deli, thiết kế hiện đại, giúp sắp xếp bàn làm việc gọn gàng. Chất liệu nhựa ABS bền bỉ.',
    specifications: { 'Số tầng': '3', 'Kích thước': '34x25x30cm', 'Chất liệu': 'Nhựa ABS', 'Tải trọng': '~200 tờ/tầng', 'Xuất xứ': 'Trung Quốc' },
    stock: 60,
    sold: 180,
    rating: 4.4,
    reviewCount: 34,
    reviews: generateReviews(4),
    colors: ['Đen', 'Trắng', 'Xám'],
    tags: ['khay tài liệu', 'deli', 'phụ kiện bàn'],
    isFlashSale: false,
    isCustomizable: false,
    createdAt: '2024-02-28T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-11',
    name: 'Bút dạ quang Staedtler Textsurfer',
    slug: 'but-da-quang-staedtler',
    sku: 'ST-HL-364',
    categoryId: 'cat-1',
    brandId: 'brand-5',
    price: 25000,
    originalPrice: 32000,
    discount: 22,
    images: [
      { id: 'img-12', url: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600', alt: 'Bút dạ quang Staedtler' },
    ],
    description: 'Bút dạ quang Staedtler Textsurfer Classic 364, mực sáng rõ, không lem, khô nhanh. Lý tưởng cho việc đánh dấu tài liệu.',
    specifications: { 'Màu': 'Vàng', 'Đầu bút': 'Đầu dẹt 1-5mm', 'Chất liệu': 'PP', 'Xuất xứ': 'Đức' },
    stock: 350,
    sold: 780,
    rating: 4.7,
    reviewCount: 112,
    reviews: generateReviews(5),
    colors: ['Vàng', 'Xanh lá', 'Hồng', 'Cam', 'Tím'],
    tags: ['bút dạ quang', 'staedtler', 'highlight'],
    isFlashSale: false,
    isCustomizable: false,
    wholesalePrice: [
      { minQty: 50, price: 20000 },
      { minQty: 100, price: 18000 },
    ],
    createdAt: '2024-03-10T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-12',
    name: 'Cốc đựng bút gỗ tre',
    slug: 'coc-dung-but-go-tre',
    sku: 'WD-PC-01',
    categoryId: 'cat-8',
    brandId: 'brand-2',
    price: 85000,
    originalPrice: 110000,
    discount: 23,
    images: [
      { id: 'img-13', url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600', alt: 'Cốc đựng bút gỗ tre' },
    ],
    description: 'Cốc đựng bút bằng gỗ tre tự nhiên, thiết kế đơn giản, sang trọng. Có thể khắc tên hoặc logo theo yêu cầu.',
    specifications: { 'Kích thước': '8x8x10cm', 'Chất liệu': 'Gỗ tre tự nhiên', 'Trọng lượng': '150g', 'Xuất xứ': 'Việt Nam' },
    stock: 100,
    sold: 250,
    rating: 4.8,
    reviewCount: 45,
    reviews: generateReviews(4),
    colors: ['Tự nhiên'],
    tags: ['cốc bút', 'gỗ tre', 'quà tặng', 'eco'],
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    flashSalePrice: 65000,
    isCustomizable: true,
    customizationOptions: ['Khắc tên', 'Khắc logo', 'Khắc hình'],
    wholesalePrice: [
      { minQty: 20, price: 70000 },
      { minQty: 50, price: 60000 },
      { minQty: 100, price: 50000 },
    ],
    createdAt: '2024-03-15T00:00:00Z',
    status: 'active',
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@vpshop.vn',
    name: 'Admin VP Shop',
    phone: '0901234567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    addresses: [
      { id: 'addr-1', name: 'Admin VP Shop', phone: '0901234567', street: '123 Nguyễn Huệ', ward: 'Phường Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true },
    ],
  },
  {
    id: 'user-2',
    email: 'nguyenvana@gmail.com',
    name: 'Nguyễn Văn A',
    phone: '0912345678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nguyen',
    role: 'customer',
    status: 'active',
    createdAt: '2024-02-15T00:00:00Z',
    addresses: [
      { id: 'addr-2', name: 'Nguyễn Văn A', phone: '0912345678', street: '456 Lê Lợi', ward: 'Phường 1', district: 'Quận 3', city: 'TP. Hồ Chí Minh', isDefault: true },
      { id: 'addr-3', name: 'Nguyễn Văn A (Công ty)', phone: '0912345678', street: '789 Trần Hưng Đạo', ward: 'Phường 5', district: 'Quận 5', city: 'TP. Hồ Chí Minh', isDefault: false },
    ],
  },
  {
    id: 'user-3',
    email: 'tranthib@gmail.com',
    name: 'Trần Thị B',
    phone: '0923456789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tran',
    role: 'customer',
    status: 'active',
    createdAt: '2024-03-01T00:00:00Z',
    addresses: [
      { id: 'addr-4', name: 'Trần Thị B', phone: '0923456789', street: '321 Hai Bà Trưng', ward: 'Phường Đa Kao', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true },
    ],
  },
  {
    id: 'user-4',
    email: 'staff@vpshop.vn',
    name: 'Nhân viên VP Shop',
    phone: '0934567890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff',
    role: 'staff',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
    addresses: [],
  },
  {
    id: 'user-5',
    email: 'levanc@gmail.com',
    name: 'Lê Văn C',
    phone: '0945678901',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=le',
    role: 'customer',
    status: 'locked',
    createdAt: '2024-02-20T00:00:00Z',
    addresses: [
      { id: 'addr-5', name: 'Lê Văn C', phone: '0945678901', street: '654 Võ Văn Tần', ward: 'Phường 6', district: 'Quận 3', city: 'TP. Hồ Chí Minh', isDefault: true },
    ],
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: 'user-2',
    items: [
      { productId: 'prod-1', productName: 'Bút bi Thiên Long TL-027', productImage: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=100', price: 5000, quantity: 10 },
      { productId: 'prod-3', productName: 'Giấy A4 Double A 80gsm', productImage: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=100', price: 89000, quantity: 2 },
    ],
    subtotal: 228000,
    shippingFee: 30000,
    discount: 20000,
    total: 238000,
    status: 'delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    shippingMethod: 'standard',
    shippingAddress: { id: 'addr-2', name: 'Nguyễn Văn A', phone: '0912345678', street: '456 Lê Lợi', ward: 'Phường 1', district: 'Quận 3', city: 'TP. Hồ Chí Minh', isDefault: true },
    voucherCode: 'WELCOME20K',
    timeline: [
      { status: 'pending', date: '2024-03-01T10:00:00Z' },
      { status: 'confirmed', date: '2024-03-01T10:30:00Z', note: 'Đơn hàng đã được xác nhận' },
      { status: 'processing', date: '2024-03-01T14:00:00Z', note: 'Đang chuẩn bị hàng' },
      { status: 'shipping', date: '2024-03-02T08:00:00Z', note: 'Đã giao cho đơn vị vận chuyển' },
      { status: 'delivered', date: '2024-03-03T15:00:00Z', note: 'Giao hàng thành công' },
    ],
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'ORD-002',
    userId: 'user-2',
    items: [
      { productId: 'prod-4', productName: 'Sổ tay bìa da A5 Deli', productImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100', price: 65000, quantity: 5, customization: { type: 'In logo công ty', text: 'VP SHOP' } },
    ],
    subtotal: 325000,
    shippingFee: 25000,
    discount: 0,
    total: 350000,
    status: 'shipping',
    paymentMethod: 'momo',
    paymentStatus: 'paid',
    shippingMethod: 'express',
    shippingAddress: { id: 'addr-3', name: 'Nguyễn Văn A (Công ty)', phone: '0912345678', street: '789 Trần Hưng Đạo', ward: 'Phường 5', district: 'Quận 5', city: 'TP. Hồ Chí Minh', isDefault: false },
    timeline: [
      { status: 'pending', date: '2024-03-10T09:00:00Z' },
      { status: 'confirmed', date: '2024-03-10T09:15:00Z' },
      { status: 'processing', date: '2024-03-10T11:00:00Z' },
      { status: 'shipping', date: '2024-03-11T08:00:00Z', note: 'Đang vận chuyển - Mã vận đơn: GHN123456' },
    ],
    createdAt: '2024-03-10T09:00:00Z',
  },
  {
    id: 'ORD-003',
    userId: 'user-3',
    items: [
      { productId: 'prod-2', productName: 'Bút gel Pentel Energel BL77', productImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=100', price: 35000, quantity: 3 },
      { productId: 'prod-5', productName: 'Kẹp bướm Deli 25mm', productImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=100', price: 15000, quantity: 5 },
      { productId: 'prod-8', productName: 'Máy bấm ghim Deli No.10', productImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=100', price: 35000, quantity: 1 },
    ],
    subtotal: 215000,
    shippingFee: 30000,
    discount: 15000,
    total: 230000,
    status: 'confirmed',
    paymentMethod: 'vnpay',
    paymentStatus: 'paid',
    shippingMethod: 'standard',
    shippingAddress: { id: 'addr-4', name: 'Trần Thị B', phone: '0923456789', street: '321 Hai Bà Trưng', ward: 'Phường Đa Kao', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true },
    voucherCode: 'SAVE15K',
    timeline: [
      { status: 'pending', date: '2024-03-12T14:00:00Z' },
      { status: 'confirmed', date: '2024-03-12T14:30:00Z', note: 'Đơn hàng đã được xác nhận' },
    ],
    createdAt: '2024-03-12T14:00:00Z',
  },
  {
    id: 'ORD-004',
    userId: 'user-2',
    items: [
      { productId: 'prod-9', productName: 'Mực in HP 680 Black', productImage: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=100', price: 185000, quantity: 2 },
    ],
    subtotal: 370000,
    shippingFee: 0,
    discount: 0,
    total: 370000,
    status: 'delivered',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    shippingMethod: 'standard',
    shippingAddress: { id: 'addr-2', name: 'Nguyễn Văn A', phone: '0912345678', street: '456 Lê Lợi', ward: 'Phường 1', district: 'Quận 3', city: 'TP. Hồ Chí Minh', isDefault: true },
    timeline: [
      { status: 'pending', date: '2024-02-20T10:00:00Z' },
      { status: 'confirmed', date: '2024-02-20T10:15:00Z' },
      { status: 'processing', date: '2024-02-20T14:00:00Z' },
      { status: 'shipping', date: '2024-02-21T08:00:00Z' },
      { status: 'delivered', date: '2024-02-22T16:00:00Z' },
    ],
    createdAt: '2024-02-20T10:00:00Z',
    returnRequest: {
      reason: 'Sản phẩm bị lỗi, mực in không đều',
      status: 'pending',
      createdAt: '2024-02-25T10:00:00Z',
    },
  },
  {
    id: 'ORD-005',
    userId: 'user-3',
    items: [
      { productId: 'prod-10', productName: 'Khay để tài liệu 3 tầng Deli', productImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100', price: 120000, quantity: 1 },
      { productId: 'prod-12', productName: 'Cốc đựng bút gỗ tre', productImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=100', price: 85000, quantity: 2, customization: { type: 'Khắc tên', text: 'Trần Thị B' } },
    ],
    subtotal: 290000,
    shippingFee: 25000,
    discount: 0,
    total: 315000,
    status: 'pending',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    shippingMethod: 'express',
    shippingAddress: { id: 'addr-4', name: 'Trần Thị B', phone: '0923456789', street: '321 Hai Bà Trưng', ward: 'Phường Đa Kao', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true },
    timeline: [
      { status: 'pending', date: '2024-03-15T16:00:00Z' },
    ],
    createdAt: '2024-03-15T16:00:00Z',
  },
];

export const mockVouchers: Voucher[] = [
  { id: 'v-1', code: 'WELCOME20K', type: 'fixed', value: 20000, minOrderValue: 100000, usageLimit: 1000, usedCount: 456, startDate: '2024-01-01T00:00:00Z', endDate: '2024-12-31T23:59:59Z', status: 'active', description: 'Giảm 20.000đ cho đơn hàng từ 100.000đ' },
  { id: 'v-2', code: 'SAVE15K', type: 'fixed', value: 15000, minOrderValue: 80000, usageLimit: 500, usedCount: 234, startDate: '2024-01-01T00:00:00Z', endDate: '2024-06-30T23:59:59Z', status: 'active', description: 'Giảm 15.000đ cho đơn hàng từ 80.000đ' },
  { id: 'v-3', code: 'SALE10', type: 'percentage', value: 10, minOrderValue: 200000, maxDiscount: 50000, usageLimit: 300, usedCount: 189, startDate: '2024-03-01T00:00:00Z', endDate: '2024-03-31T23:59:59Z', status: 'active', description: 'Giảm 10% tối đa 50.000đ cho đơn từ 200.000đ' },
  { id: 'v-4', code: 'FLASH50', type: 'percentage', value: 50, minOrderValue: 500000, maxDiscount: 200000, usageLimit: 50, usedCount: 50, startDate: '2024-02-14T00:00:00Z', endDate: '2024-02-14T23:59:59Z', status: 'expired', description: 'Flash Sale Valentine - Giảm 50% tối đa 200.000đ' },
  { id: 'v-5', code: 'BULK20', type: 'percentage', value: 20, minOrderValue: 1000000, maxDiscount: 500000, usageLimit: 100, usedCount: 12, startDate: '2024-01-01T00:00:00Z', endDate: '2024-12-31T23:59:59Z', status: 'active', description: 'Giảm 20% cho đơn hàng sỉ từ 1.000.000đ' },
];

export const mockChatMessages: ChatMessage[] = [
  { id: 'msg-1', senderId: 'user-2', senderName: 'Nguyễn Văn A', senderRole: 'customer', message: 'Xin chào, tôi muốn hỏi về sản phẩm bút bi Thiên Long', timestamp: '2024-03-15T10:00:00Z', isRead: true },
  { id: 'msg-2', senderId: 'user-1', senderName: 'Admin VP Shop', senderRole: 'admin', message: 'Chào anh/chị! Em có thể giúp gì ạ?', timestamp: '2024-03-15T10:01:00Z', isRead: true },
  { id: 'msg-3', senderId: 'user-2', senderName: 'Nguyễn Văn A', senderRole: 'customer', message: 'Bút bi TL-027 có thể in logo công ty được không?', timestamp: '2024-03-15T10:02:00Z', isRead: true },
  { id: 'msg-4', senderId: 'user-1', senderName: 'Admin VP Shop', senderRole: 'admin', message: 'Dạ được ạ! Bút bi TL-027 hỗ trợ in tên và logo công ty. Anh/chị đặt từ 50 cây trở lên sẽ được giá sỉ ạ.', timestamp: '2024-03-15T10:03:00Z', isRead: true },
  { id: 'msg-5', senderId: 'user-2', senderName: 'Nguyễn Văn A', senderRole: 'customer', message: 'Vậy giá sỉ 100 cây là bao nhiêu?', timestamp: '2024-03-15T10:04:00Z', isRead: false },
];

// ==================== HELPER FUNCTIONS ====================

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(p => p.categoryId === categoryId);
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(c => c.id === id);
};

export const getBrandById = (id: string): Brand | undefined => {
  return brands.find(b => b.id === id);
};

export const getFlashSaleProducts = (): Product[] => {
  return products.filter(p => p.isFlashSale);
};

export const getCustomizableProducts = (): Product[] => {
  return products.filter(p => p.isCustomizable);
};

export const searchProducts = (query: string): Product[] => {
  const lower = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.sku.toLowerCase().includes(lower) ||
    p.tags.some(t => t.toLowerCase().includes(lower))
  );
};

export const getSearchSuggestions = (query: string): string[] => {
  if (!query) return [];
  const lower = query.toLowerCase();
  const suggestions = new Set<string>();
  products.forEach(p => {
    if (p.name.toLowerCase().includes(lower)) suggestions.add(p.name);
    p.tags.forEach(t => {
      if (t.toLowerCase().includes(lower)) suggestions.add(t);
    });
  });
  return Array.from(suggestions).slice(0, 5);
};

// Dashboard stats
export const getDashboardStats = () => ({
  totalRevenue: 15680000,
  totalOrders: 156,
  totalProducts: products.length,
  totalCustomers: mockUsers.filter(u => u.role === 'customer').length,
  newCustomersThisMonth: 12,
  pendingOrders: mockOrders.filter(o => o.status === 'pending').length,
  lowStockProducts: products.filter(p => p.stock < 100).length,
  revenueByMonth: [
    { month: 'T1', revenue: 12500000, orders: 45 },
    { month: 'T2', revenue: 15200000, orders: 52 },
    { month: 'T3', revenue: 18900000, orders: 68 },
    { month: 'T4', revenue: 14300000, orders: 41 },
    { month: 'T5', revenue: 21000000, orders: 75 },
    { month: 'T6', revenue: 19500000, orders: 63 },
    { month: 'T7', revenue: 22800000, orders: 82 },
    { month: 'T8', revenue: 17600000, orders: 58 },
    { month: 'T9', revenue: 24100000, orders: 89 },
    { month: 'T10', revenue: 20300000, orders: 71 },
    { month: 'T11', revenue: 26500000, orders: 95 },
    { month: 'T12', revenue: 28900000, orders: 108 },
  ],
  topProducts: [
    { name: 'Giấy A4 Double A', sold: 3200, revenue: 284800000 },
    { name: 'Bút bi Thiên Long TL-027', sold: 1250, revenue: 6250000 },
    { name: 'Băng keo trong Deli', sold: 1100, revenue: 24200000 },
    { name: 'Kẹp bướm Deli 25mm', sold: 890, revenue: 13350000 },
    { name: 'Bút gel Pentel Energel', sold: 856, revenue: 29960000 },
  ],
  ordersByStatus: [
    { status: 'Chờ xác nhận', count: 15 },
    { status: 'Đã xác nhận', count: 23 },
    { status: 'Đang giao', count: 18 },
    { status: 'Đã giao', count: 89 },
    { status: 'Đã hủy', count: 8 },
    { status: 'Hoàn hàng', count: 3 },
  ],
  returnRate: 2.1,
});
