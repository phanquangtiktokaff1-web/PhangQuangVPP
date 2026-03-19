const express = require('express');
const { getPool, sql } = require('../libs/db');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const { safeJsonParse } = require('../utils/mapRows');

const router = express.Router();

async function buildOrders(pool, userId) {
  const ordersResult = await pool.request()
    .input('userId', sql.NVarChar, userId)
    .query('SELECT * FROM dbo.orders WHERE userId = @userId ORDER BY createdAt DESC');

  const itemResult = await pool.request()
    .input('userId', sql.NVarChar, userId)
    .query(`
      SELECT oi.*
      FROM dbo.order_items oi
      INNER JOIN dbo.orders o ON o.id = oi.orderId
      WHERE o.userId = @userId
    `);

  const timelineResult = await pool.request()
    .input('userId', sql.NVarChar, userId)
    .query(`
      SELECT ot.*
      FROM dbo.order_timeline ot
      INNER JOIN dbo.orders o ON o.id = ot.orderId
      WHERE o.userId = @userId
      ORDER BY ot.[date]
    `);

  return buildOrdersFromRows(ordersResult.recordset, itemResult.recordset, timelineResult.recordset);
}

async function buildAllOrders(pool, { status, q } = {}) {
  const request = pool.request();
  const conditions = [];

  if (status && status !== 'all') {
    request.input('statusFilter', sql.NVarChar, status);
    conditions.push("[status] = @statusFilter");
  }
  if (q) {
    request.input('q', sql.NVarChar, `%${q}%`);
    conditions.push("(id LIKE @q OR shippingAddress LIKE @q)");
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const ordersResult = await request.query(`SELECT * FROM dbo.orders ${where} ORDER BY createdAt DESC`);
  if (ordersResult.recordset.length === 0) return [];

  const allItems = await pool.request().query('SELECT * FROM dbo.order_items');
  const allTimelines = await pool.request().query('SELECT * FROM dbo.order_timeline ORDER BY [date]');

  return buildOrdersFromRows(ordersResult.recordset, allItems.recordset, allTimelines.recordset);
}

function buildOrdersFromRows(orders, items, timelines) {
  const itemsByOrder = items.reduce((acc, row) => {
    acc[row.orderId] = acc[row.orderId] || [];
    acc[row.orderId].push({
      productId: row.productId,
      productName: row.productName,
      productImage: row.productImage,
      price: Number(row.price),
      quantity: row.quantity,
      customization: safeJsonParse(row.customization, null),
    });
    return acc;
  }, {});

  const timelineByOrder = timelines.reduce((acc, row) => {
    acc[row.orderId] = acc[row.orderId] || [];
    acc[row.orderId].push({ status: row.status, date: row.date, note: row.note });
    return acc;
  }, {});

  return orders.map((row) => ({
    ...row,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shippingFee),
    discount: Number(row.discount),
    total: Number(row.total),
    shippingAddress: safeJsonParse(row.shippingAddress, {}),
    returnRequest: safeJsonParse(row.returnRequest, null),
    items: itemsByOrder[row.id] || [],
    timeline: timelineByOrder[row.id] || [],
  }));
}

// ==================== CUSTOMER ====================

router.get('/my-orders', authMiddleware, async (req, res, next) => {
  try {
    const pool = await getPool();
    const orders = await buildOrders(pool, req.user.userId);
    return res.json(orders);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const {
      items, subtotal, shippingFee, discount, total,
      paymentMethod, shippingMethod, shippingAddress, voucherCode, note,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    const orderId = `ORD-${Date.now().toString().slice(-8)}`;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.NVarChar, orderId)
      .input('userId', sql.NVarChar, req.user.userId)
      .input('subtotal', sql.Decimal(18, 2), subtotal || 0)
      .input('shippingFee', sql.Decimal(18, 2), shippingFee || 0)
      .input('discount', sql.Decimal(18, 2), discount || 0)
      .input('total', sql.Decimal(18, 2), total || 0)
      .input('status', sql.NVarChar, 'pending')
      .input('paymentMethod', sql.NVarChar, paymentMethod || 'cod')
      .input('paymentStatus', sql.NVarChar, 'pending')
      .input('shippingMethod', sql.NVarChar, shippingMethod || 'standard')
      .input('shippingAddress', sql.NVarChar(sql.MAX), JSON.stringify(shippingAddress || {}))
      .input('voucherCode', sql.NVarChar, voucherCode || null)
      .input('note', sql.NVarChar(sql.MAX), note || null)
      .query(`
        INSERT INTO dbo.orders (
          id, userId, subtotal, shippingFee, discount, total, status, paymentMethod, paymentStatus,
          shippingMethod, shippingAddress, voucherCode, note, createdAt, returnRequest
        )
        VALUES (
          @id, @userId, @subtotal, @shippingFee, @discount, @total, @status, @paymentMethod, @paymentStatus,
          @shippingMethod, @shippingAddress, @voucherCode, @note, SYSUTCDATETIME(), NULL
        )
      `);

    for (const item of items) {
      const productResult = await pool.request()
        .input('productId', sql.NVarChar, item.productId)
        .query('SELECT TOP 1 id, name, images, isCustomizable FROM dbo.products WHERE id = @productId');

      const product = productResult.recordset[0];
      if (!product) {
        return res.status(400).json({ message: `Sản phẩm không tồn tại: ${item.productId}` });
      }

      let normalizedCustomization = null;
      if (item.customization) {
        const type = typeof item.customization.type === 'string' ? item.customization.type.trim() : '';
        const text = typeof item.customization.text === 'string' ? item.customization.text.trim() : '';

        if (!type || !text) {
          return res.status(400).json({ message: `Thông tin tùy chỉnh không hợp lệ cho sản phẩm: ${product.name}` });
        }

        if (!product.isCustomizable) {
          return res.status(400).json({ message: `Sản phẩm không hỗ trợ tùy chỉnh: ${product.name}` });
        }

        normalizedCustomization = { type, text };
      }

      const images = safeJsonParse(product.images, []);
      const productImage = Array.isArray(images) && images[0]?.url ? images[0].url : '';

      await pool.request()
        .input('orderId', sql.NVarChar, orderId)
        .input('productId', sql.NVarChar, item.productId)
        .input('productName', sql.NVarChar, product.name || item.productName || '')
        .input('productImage', sql.NVarChar, productImage || item.productImage || '')
        .input('price', sql.Decimal(18, 2), item.price || 0)
        .input('quantity', sql.Int, item.quantity || 1)
        .input('customization', sql.NVarChar(sql.MAX), JSON.stringify(normalizedCustomization))
        .query('INSERT INTO dbo.order_items (orderId, productId, productName, productImage, price, quantity, customization) VALUES (@orderId, @productId, @productName, @productImage, @price, @quantity, @customization)');
    }

    await pool.request()
      .input('orderId', sql.NVarChar, orderId)
      .query("INSERT INTO dbo.order_timeline (orderId, status, date, note) VALUES (@orderId, 'pending', SYSUTCDATETIME(), NULL)");

    // Mark voucher used
    if (voucherCode) {
      await pool.request()
        .input('code', sql.NVarChar, voucherCode.toUpperCase())
        .query('UPDATE dbo.vouchers SET usedCount = usedCount + 1 WHERE code = @code');
    }

    return res.status(201).json({ id: orderId, message: 'Order created successfully' });
  } catch (error) {
    return next(error);
  }
});

// Customer cancel pending order
router.post('/:id/cancel', authMiddleware, async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('userId', sql.NVarChar, req.user.userId)
      .query("SELECT TOP 1 id, [status] FROM dbo.orders WHERE id = @id AND userId = @userId");

    const order = result.recordset[0];
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận' });
    }

    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query("UPDATE dbo.orders SET [status] = 'cancelled' WHERE id = @id");

    await pool.request()
      .input('orderId', sql.NVarChar, req.params.id)
      .query("INSERT INTO dbo.order_timeline (orderId, status, date, note) VALUES (@orderId, 'cancelled', SYSUTCDATETIME(), N'Khách hàng hủy đơn')");

    return res.json({ message: 'Order cancelled' });
  } catch (error) {
    return next(error);
  }
});

// Customer submit return request
router.post('/:id/return-request', authMiddleware, async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('userId', sql.NVarChar, req.user.userId)
      .query("SELECT TOP 1 id, [status], returnRequest FROM dbo.orders WHERE id = @id AND userId = @userId");

    const order = result.recordset[0];
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Chỉ có thể yêu cầu hoàn hàng sau khi đã giao' });
    }
    if (order.returnRequest) {
      return res.status(409).json({ message: 'Đã tồn tại yêu cầu hoàn hàng' });
    }

    const returnRequest = { reason, status: 'pending', createdAt: new Date().toISOString() };
    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('returnRequest', sql.NVarChar(sql.MAX), JSON.stringify(returnRequest))
      .query("UPDATE dbo.orders SET returnRequest = @returnRequest WHERE id = @id");

    return res.status(201).json({ message: 'Return request submitted', returnRequest });
  } catch (error) {
    return next(error);
  }
});

// ==================== ADMIN ====================

// Get ALL orders (admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const pool = await getPool();
    const orders = await buildAllOrders(pool, { status, q });
    return res.json(orders);
  } catch (error) {
    return next(error);
  }
});

// Update order status (admin)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const pool = await getPool();
    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('status', sql.NVarChar, status)
      .query("UPDATE dbo.orders SET [status] = @status WHERE id = @id");

    await pool.request()
      .input('orderId', sql.NVarChar, req.params.id)
      .input('status', sql.NVarChar, status)
      .input('note', sql.NVarChar, note || null)
      .query("INSERT INTO dbo.order_timeline (orderId, status, date, note) VALUES (@orderId, @status, SYSUTCDATETIME(), @note)");

    return res.json({ message: 'Order status updated' });
  } catch (error) {
    return next(error);
  }
});

// Approve/reject return request (admin)
router.patch('/:id/return', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { action, note } = req.body; // action: 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Action must be approved or rejected' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('SELECT TOP 1 returnRequest FROM dbo.orders WHERE id = @id');

    const order = result.recordset[0];
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const returnRequest = safeJsonParse(order.returnRequest, null);
    if (!returnRequest) return res.status(400).json({ message: 'No return request found' });

    returnRequest.status = action;
    returnRequest.resolvedAt = new Date().toISOString();
    if (note) returnRequest.note = note;

    const newOrderStatus = action === 'approved' ? 'returned' : 'delivered';

    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .input('returnRequest', sql.NVarChar(sql.MAX), JSON.stringify(returnRequest))
      .input('status', sql.NVarChar, newOrderStatus)
      .query("UPDATE dbo.orders SET returnRequest = @returnRequest, [status] = @status WHERE id = @id");

    await pool.request()
      .input('orderId', sql.NVarChar, req.params.id)
      .input('status', sql.NVarChar, newOrderStatus)
      .input('note', sql.NVarChar, note || (action === 'approved' ? 'Đã duyệt hoàn hàng' : 'Từ chối hoàn hàng'))
      .query("INSERT INTO dbo.order_timeline (orderId, status, date, note) VALUES (@orderId, @status, SYSUTCDATETIME(), @note)");

    return res.json({ message: `Return request ${action}` });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
