const bcrypt = require('bcryptjs');

const categories = [
  { id: 'cat-1', name: 'Bút viết', slug: 'but-viet', icon: 'PenTool', description: 'Các loại bút bi, bút gel, bút dạ quang', productCount: 45, image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400' },
  { id: 'cat-2', name: 'Giấy & Sổ', slug: 'giay-so', icon: 'BookOpen', description: 'Giấy A4, sổ tay, vở viết', productCount: 32, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400' },
  { id: 'cat-3', name: 'Kẹp & Ghim', slug: 'kep-ghim', icon: 'Paperclip', description: 'Kẹp giấy, ghim bấm, kẹp bướm', productCount: 28, image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400' },
  { id: 'cat-4', name: 'Hồ sơ & Bìa', slug: 'ho-so-bia', icon: 'Folder', description: 'Bìa hồ sơ, file tài liệu, bìa lá', productCount: 22, image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400' },
  { id: 'cat-8', name: 'Phụ kiện bàn làm việc', slug: 'phu-kien-ban', icon: 'Archive', description: 'Khay để tài liệu, hộp bút, lịch bàn', productCount: 20, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400' },
];

const brands = [
  { id: 'brand-1', name: 'Thiên Long', logo: '/brands/thienlong.png' },
  { id: 'brand-2', name: 'Deli', logo: '/brands/deli.png' },
  { id: 'brand-4', name: 'Pentel', logo: '/brands/pentel.png' },
  { id: 'brand-6', name: 'Double A', logo: '/brands/doublea.png' },
  { id: 'brand-8', name: 'Canon', logo: '/brands/canon.png' },
];

const products = [
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
    images: [{ id: 'img-1', url: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600', alt: 'Bút bi Thiên Long' }],
    description: 'Bút bi Thiên Long TL-027 với thiết kế thân bút trong suốt, mực viết đều và mượt mà.',
    specifications: { 'Màu mực': 'Xanh', 'Đường kính viên bi': '0.5mm', 'Chiều dài': '14cm' },
    stock: 500,
    sold: 1250,
    rating: 4.5,
    reviewCount: 89,
    reviews: [],
    colors: ['Xanh', 'Đỏ', 'Đen'],
    tags: ['bút bi', 'thiên long', 'văn phòng phẩm'],
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    flashSalePrice: 3500,
    isCustomizable: true,
    customizationOptions: ['In tên', 'In logo công ty'],
    wholesalePrice: [{ minQty: 50, price: 4000 }, { minQty: 100, price: 3500 }],
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
    images: [{ id: 'img-3', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600', alt: 'Bút gel Pentel' }],
    description: 'Bút gel Pentel Energel BL77 với công nghệ mực gel tiên tiến.',
    specifications: { 'Màu mực': 'Đen', 'Đường kính viên bi': '0.7mm' },
    stock: 200,
    sold: 856,
    rating: 4.8,
    reviewCount: 156,
    reviews: [],
    colors: ['Đen', 'Xanh', 'Đỏ'],
    tags: ['bút gel', 'pentel', 'cao cấp'],
    isFlashSale: false,
    flashSaleEnd: null,
    flashSalePrice: null,
    isCustomizable: true,
    customizationOptions: ['Khắc tên'],
    wholesalePrice: [{ minQty: 50, price: 30000 }, { minQty: 100, price: 28000 }],
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
    images: [{ id: 'img-4', url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600', alt: 'Giấy A4 Double A' }],
    description: 'Giấy A4 Double A 80gsm chất lượng cao, trắng sáng, không kẹt giấy.',
    specifications: { 'Kích thước': 'A4', 'Định lượng': '80gsm', 'Số tờ': '500 tờ/ram' },
    stock: 1000,
    sold: 3200,
    rating: 4.7,
    reviewCount: 245,
    reviews: [],
    colors: ['Trắng'],
    tags: ['giấy a4', 'double a', 'in ấn'],
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    flashSalePrice: 75000,
    isCustomizable: false,
    customizationOptions: [],
    wholesalePrice: [{ minQty: 10, price: 82000 }, { minQty: 50, price: 78000 }],
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
    images: [{ id: 'img-5', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600', alt: 'Sổ tay Deli' }],
    description: 'Sổ tay bìa da cao cấp Deli, kích thước A5, 200 trang giấy trắng ngà.',
    specifications: { 'Kích thước': 'A5', 'Số trang': '200 trang' },
    stock: 150,
    sold: 420,
    rating: 4.3,
    reviewCount: 67,
    reviews: [],
    colors: ['Đen', 'Nâu', 'Xanh navy'],
    tags: ['sổ tay', 'deli', 'bìa da'],
    isFlashSale: false,
    flashSaleEnd: null,
    flashSalePrice: null,
    isCustomizable: true,
    customizationOptions: ['In tên', 'In logo công ty'],
    wholesalePrice: [{ minQty: 20, price: 55000 }, { minQty: 50, price: 48000 }],
    createdAt: '2024-03-01T00:00:00Z',
    status: 'active',
  },
  {
    id: 'prod-12',
    name: 'Cốc đựng bút gỗ tre Eco',
    slug: 'coc-dung-but-go-tre-eco',
    sku: 'ECO-PEN-CUP',
    categoryId: 'cat-8',
    brandId: 'brand-8',
    price: 85000,
    originalPrice: 110000,
    discount: 23,
    images: [{ id: 'img-13', url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600', alt: 'Cốc đựng bút gỗ tre' }],
    description: 'Cốc đựng bút bằng gỗ tre tự nhiên, thiết kế đơn giản, sang trọng.',
    specifications: { 'Kích thước': '8x8x10cm', 'Chất liệu': 'Gỗ tre tự nhiên' },
    stock: 100,
    sold: 250,
    rating: 4.8,
    reviewCount: 45,
    reviews: [],
    colors: ['Tự nhiên'],
    tags: ['cốc bút', 'gỗ tre', 'eco'],
    isFlashSale: true,
    flashSaleEnd: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    flashSalePrice: 65000,
    isCustomizable: true,
    customizationOptions: ['Khắc tên', 'Khắc logo'],
    wholesalePrice: [{ minQty: 20, price: 70000 }, { minQty: 50, price: 60000 }],
    createdAt: '2024-03-15T00:00:00Z',
    status: 'active',
  },
];

const users = [
  { id: 'user-1', email: 'admin@vpshop.vn', name: 'Admin VP Shop', phone: '0901234567', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', role: 'admin', status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'user-2', email: 'nguyenvana@gmail.com', name: 'Nguyễn Văn A', phone: '0912345678', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nguyen', role: 'customer', status: 'active', createdAt: '2024-02-15T00:00:00Z' },
  { id: 'user-3', email: 'staff@vpshop.vn', name: 'Nhân viên VP Shop', phone: '0934567890', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff', role: 'staff', status: 'active', createdAt: '2024-01-15T00:00:00Z' },
];

const addresses = [
  { id: 'addr-1', userId: 'user-1', name: 'Admin VP Shop', phone: '0901234567', street: '123 Nguyễn Huệ', ward: 'Phường Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true },
  { id: 'addr-2', userId: 'user-2', name: 'Nguyễn Văn A', phone: '0912345678', street: '456 Lê Lợi', ward: 'Phường 1', district: 'Quận 3', city: 'TP. Hồ Chí Minh', isDefault: true },
  { id: 'addr-3', userId: 'user-2', name: 'Nguyễn Văn A (Công ty)', phone: '0912345678', street: '789 Trần Hưng Đạo', ward: 'Phường 5', district: 'Quận 5', city: 'TP. Hồ Chí Minh', isDefault: false },
];

const vouchers = [
  { id: 'v-1', code: 'WELCOME20K', type: 'fixed', value: 20000, minOrderValue: 100000, maxDiscount: null, usageLimit: 1000, usedCount: 456, startDate: '2024-01-01T00:00:00Z', endDate: '2026-12-31T23:59:59Z', status: 'active', description: 'Giảm 20.000đ cho đơn hàng từ 100.000đ' },
  { id: 'v-2', code: 'SAVE15K', type: 'fixed', value: 15000, minOrderValue: 80000, maxDiscount: null, usageLimit: 500, usedCount: 234, startDate: '2024-01-01T00:00:00Z', endDate: '2026-06-30T23:59:59Z', status: 'active', description: 'Giảm 15.000đ cho đơn hàng từ 80.000đ' },
  { id: 'v-3', code: 'SALE10', type: 'percentage', value: 10, minOrderValue: 200000, maxDiscount: 50000, usageLimit: 300, usedCount: 189, startDate: '2024-03-01T00:00:00Z', endDate: '2026-12-31T23:59:59Z', status: 'active', description: 'Giảm 10% tối đa 50.000đ cho đơn từ 200.000đ' },
];

const orders = [
  {
    id: 'ORD-001',
    userId: 'user-2',
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
    note: null,
    createdAt: '2024-03-01T10:00:00Z',
    returnRequest: null,
    items: [
      { productId: 'prod-1', productName: 'Bút bi Thiên Long TL-027', productImage: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=100', price: 5000, quantity: 10, customization: null },
      { productId: 'prod-3', productName: 'Giấy A4 Double A 80gsm', productImage: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=100', price: 89000, quantity: 2, customization: null },
    ],
    timeline: [
      { status: 'pending', date: '2024-03-01T10:00:00Z', note: null },
      { status: 'confirmed', date: '2024-03-01T10:30:00Z', note: 'Đơn hàng đã được xác nhận' },
      { status: 'processing', date: '2024-03-01T14:00:00Z', note: 'Đang chuẩn bị hàng' },
      { status: 'shipping', date: '2024-03-02T08:00:00Z', note: 'Đã giao cho đơn vị vận chuyển' },
      { status: 'delivered', date: '2024-03-03T15:00:00Z', note: 'Giao hàng thành công' },
    ],
  },
  {
    id: 'ORD-002',
    userId: 'user-2',
    subtotal: 325000,
    shippingFee: 25000,
    discount: 0,
    total: 350000,
    status: 'shipping',
    paymentMethod: 'momo',
    paymentStatus: 'paid',
    shippingMethod: 'express',
    shippingAddress: { id: 'addr-3', name: 'Nguyễn Văn A (Công ty)', phone: '0912345678', street: '789 Trần Hưng Đạo', ward: 'Phường 5', district: 'Quận 5', city: 'TP. Hồ Chí Minh', isDefault: false },
    voucherCode: null,
    note: null,
    createdAt: '2024-03-10T09:00:00Z',
    returnRequest: null,
    items: [
      { productId: 'prod-4', productName: 'Sổ tay bìa da A5 Deli', productImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100', price: 65000, quantity: 5, customization: { type: 'In logo công ty', text: 'VP SHOP' } },
    ],
    timeline: [
      { status: 'pending', date: '2024-03-10T09:00:00Z', note: null },
      { status: 'confirmed', date: '2024-03-10T09:15:00Z', note: null },
      { status: 'processing', date: '2024-03-10T11:00:00Z', note: null },
      { status: 'shipping', date: '2024-03-11T08:00:00Z', note: 'Đang vận chuyển - Mã vận đơn: GHN123456' },
    ],
  },
];

const chatMessages = [
  { id: 'msg-1', senderId: 'user-2', senderName: 'Nguyễn Văn A', senderRole: 'customer', message: 'Xin chào, tôi muốn hỏi về sản phẩm bút bi Thiên Long', timestamp: '2024-03-15T10:00:00Z', isRead: true },
  { id: 'msg-2', senderId: 'user-1', senderName: 'Admin VP Shop', senderRole: 'admin', message: 'Chào anh/chị! Em có thể giúp gì ạ?', timestamp: '2024-03-15T10:01:00Z', isRead: true },
];

async function seedData(pool, sql) {
  for (const brand of brands) {
    await pool.request()
      .input('id', sql.NVarChar, brand.id)
      .input('name', sql.NVarChar, brand.name)
      .input('logo', sql.NVarChar, brand.logo)
      .query('INSERT INTO dbo.brands (id, name, logo) VALUES (@id, @name, @logo)');
  }

  for (const category of categories) {
    await pool.request()
      .input('id', sql.NVarChar, category.id)
      .input('name', sql.NVarChar, category.name)
      .input('slug', sql.NVarChar, category.slug)
      .input('icon', sql.NVarChar, category.icon)
      .input('description', sql.NVarChar, category.description)
      .input('productCount', sql.Int, category.productCount)
      .input('image', sql.NVarChar, category.image)
      .query('INSERT INTO dbo.categories (id, name, slug, icon, description, productCount, image) VALUES (@id, @name, @slug, @icon, @description, @productCount, @image)');
  }

  for (const product of products) {
    await pool.request()
      .input('id', sql.NVarChar, product.id)
      .input('name', sql.NVarChar, product.name)
      .input('slug', sql.NVarChar, product.slug)
      .input('sku', sql.NVarChar, product.sku)
      .input('categoryId', sql.NVarChar, product.categoryId)
      .input('brandId', sql.NVarChar, product.brandId)
      .input('price', sql.Decimal(18, 2), product.price)
      .input('originalPrice', sql.Decimal(18, 2), product.originalPrice)
      .input('discount', sql.Int, product.discount)
      .input('images', sql.NVarChar(sql.MAX), JSON.stringify(product.images))
      .input('description', sql.NVarChar(sql.MAX), product.description)
      .input('specifications', sql.NVarChar(sql.MAX), JSON.stringify(product.specifications))
      .input('stock', sql.Int, product.stock)
      .input('sold', sql.Int, product.sold)
      .input('rating', sql.Decimal(3, 2), product.rating)
      .input('reviewCount', sql.Int, product.reviewCount)
      .input('reviews', sql.NVarChar(sql.MAX), JSON.stringify(product.reviews))
      .input('colors', sql.NVarChar(sql.MAX), JSON.stringify(product.colors))
      .input('tags', sql.NVarChar(sql.MAX), JSON.stringify(product.tags))
      .input('isFlashSale', sql.Bit, product.isFlashSale)
      .input('flashSaleEnd', sql.DateTime2, product.flashSaleEnd)
      .input('flashSalePrice', sql.Decimal(18, 2), product.flashSalePrice)
      .input('isCustomizable', sql.Bit, product.isCustomizable)
      .input('customizationOptions', sql.NVarChar(sql.MAX), JSON.stringify(product.customizationOptions || []))
      .input('wholesalePrice', sql.NVarChar(sql.MAX), JSON.stringify(product.wholesalePrice || []))
      .input('createdAt', sql.DateTime2, product.createdAt)
      .input('status', sql.NVarChar, product.status)
      .query(`
        INSERT INTO dbo.products (
          id, name, slug, sku, categoryId, brandId, price, originalPrice, discount, images, description,
          specifications, stock, sold, rating, reviewCount, reviews, colors, tags,
          isFlashSale, flashSaleEnd, flashSalePrice, isCustomizable, customizationOptions, wholesalePrice,
          createdAt, status
        ) VALUES (
          @id, @name, @slug, @sku, @categoryId, @brandId, @price, @originalPrice, @discount, @images, @description,
          @specifications, @stock, @sold, @rating, @reviewCount, @reviews, @colors, @tags,
          @isFlashSale, @flashSaleEnd, @flashSalePrice, @isCustomizable, @customizationOptions, @wholesalePrice,
          @createdAt, @status
        )
      `);
  }

  const defaultPasswordHash = await bcrypt.hash('123456', 10);
  for (const user of users) {
    await pool.request()
      .input('id', sql.NVarChar, user.id)
      .input('email', sql.NVarChar, user.email)
      .input('name', sql.NVarChar, user.name)
      .input('phone', sql.NVarChar, user.phone)
      .input('avatar', sql.NVarChar, user.avatar)
      .input('role', sql.NVarChar, user.role)
      .input('status', sql.NVarChar, user.status)
      .input('passwordHash', sql.NVarChar, defaultPasswordHash)
      .input('createdAt', sql.DateTime2, user.createdAt)
      .query('INSERT INTO dbo.users (id, email, name, phone, avatar, role, status, passwordHash, createdAt) VALUES (@id, @email, @name, @phone, @avatar, @role, @status, @passwordHash, @createdAt)');
  }

  for (const addr of addresses) {
    await pool.request()
      .input('id', sql.NVarChar, addr.id)
      .input('userId', sql.NVarChar, addr.userId)
      .input('name', sql.NVarChar, addr.name)
      .input('phone', sql.NVarChar, addr.phone)
      .input('street', sql.NVarChar, addr.street)
      .input('ward', sql.NVarChar, addr.ward)
      .input('district', sql.NVarChar, addr.district)
      .input('city', sql.NVarChar, addr.city)
      .input('isDefault', sql.Bit, addr.isDefault)
      .query('INSERT INTO dbo.addresses (id, userId, name, phone, street, ward, district, city, isDefault) VALUES (@id, @userId, @name, @phone, @street, @ward, @district, @city, @isDefault)');
  }

  for (const voucher of vouchers) {
    await pool.request()
      .input('id', sql.NVarChar, voucher.id)
      .input('code', sql.NVarChar, voucher.code)
      .input('type', sql.NVarChar, voucher.type)
      .input('value', sql.Decimal(18, 2), voucher.value)
      .input('minOrderValue', sql.Decimal(18, 2), voucher.minOrderValue)
      .input('maxDiscount', sql.Decimal(18, 2), voucher.maxDiscount)
      .input('usageLimit', sql.Int, voucher.usageLimit)
      .input('usedCount', sql.Int, voucher.usedCount)
      .input('startDate', sql.DateTime2, voucher.startDate)
      .input('endDate', sql.DateTime2, voucher.endDate)
      .input('status', sql.NVarChar, voucher.status)
      .input('description', sql.NVarChar, voucher.description)
      .query('INSERT INTO dbo.vouchers (id, code, type, value, minOrderValue, maxDiscount, usageLimit, usedCount, startDate, endDate, status, description) VALUES (@id, @code, @type, @value, @minOrderValue, @maxDiscount, @usageLimit, @usedCount, @startDate, @endDate, @status, @description)');
  }

  for (const order of orders) {
    await pool.request()
      .input('id', sql.NVarChar, order.id)
      .input('userId', sql.NVarChar, order.userId)
      .input('subtotal', sql.Decimal(18, 2), order.subtotal)
      .input('shippingFee', sql.Decimal(18, 2), order.shippingFee)
      .input('discount', sql.Decimal(18, 2), order.discount)
      .input('total', sql.Decimal(18, 2), order.total)
      .input('status', sql.NVarChar, order.status)
      .input('paymentMethod', sql.NVarChar, order.paymentMethod)
      .input('paymentStatus', sql.NVarChar, order.paymentStatus)
      .input('shippingMethod', sql.NVarChar, order.shippingMethod)
      .input('shippingAddress', sql.NVarChar(sql.MAX), JSON.stringify(order.shippingAddress))
      .input('voucherCode', sql.NVarChar, order.voucherCode)
      .input('note', sql.NVarChar(sql.MAX), order.note)
      .input('createdAt', sql.DateTime2, order.createdAt)
      .input('returnRequest', sql.NVarChar(sql.MAX), JSON.stringify(order.returnRequest))
      .query('INSERT INTO dbo.orders (id, userId, subtotal, shippingFee, discount, total, status, paymentMethod, paymentStatus, shippingMethod, shippingAddress, voucherCode, note, createdAt, returnRequest) VALUES (@id, @userId, @subtotal, @shippingFee, @discount, @total, @status, @paymentMethod, @paymentStatus, @shippingMethod, @shippingAddress, @voucherCode, @note, @createdAt, @returnRequest)');

    for (const item of order.items) {
      await pool.request()
        .input('orderId', sql.NVarChar, order.id)
        .input('productId', sql.NVarChar, item.productId)
        .input('productName', sql.NVarChar, item.productName)
        .input('productImage', sql.NVarChar, item.productImage)
        .input('price', sql.Decimal(18, 2), item.price)
        .input('quantity', sql.Int, item.quantity)
        .input('customization', sql.NVarChar(sql.MAX), JSON.stringify(item.customization))
        .query('INSERT INTO dbo.order_items (orderId, productId, productName, productImage, price, quantity, customization) VALUES (@orderId, @productId, @productName, @productImage, @price, @quantity, @customization)');
    }

    for (const entry of order.timeline) {
      await pool.request()
        .input('orderId', sql.NVarChar, order.id)
        .input('status', sql.NVarChar, entry.status)
        .input('date', sql.DateTime2, entry.date)
        .input('note', sql.NVarChar, entry.note)
        .query('INSERT INTO dbo.order_timeline (orderId, status, date, note) VALUES (@orderId, @status, @date, @note)');
    }
  }

  for (const msg of chatMessages) {
    await pool.request()
      .input('id', sql.NVarChar, msg.id)
      .input('senderId', sql.NVarChar, msg.senderId)
      .input('senderName', sql.NVarChar, msg.senderName)
      .input('senderRole', sql.NVarChar, msg.senderRole)
      .input('message', sql.NVarChar(sql.MAX), msg.message)
      .input('timestamp', sql.DateTime2, msg.timestamp)
      .input('isRead', sql.Bit, msg.isRead)
      .query('INSERT INTO dbo.chat_messages (id, senderId, senderName, senderRole, message, timestamp, isRead) VALUES (@id, @senderId, @senderName, @senderRole, @message, @timestamp, @isRead)');
  }
}

module.exports = { seedData };
