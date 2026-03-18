const express = require('express');
const { getPool, sql } = require('../libs/db');
const { authMiddleware } = require('../middlewares/authMiddleware');
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

  const itemsByOrder = itemResult.recordset.reduce((acc, row) => {
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

  const timelineByOrder = timelineResult.recordset.reduce((acc, row) => {
    acc[row.orderId] = acc[row.orderId] || [];
    acc[row.orderId].push({
      status: row.status,
      date: row.date,
      note: row.note,
    });
    return acc;
  }, {});

  return ordersResult.recordset.map((row) => ({
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
      items,
      subtotal,
      shippingFee,
      discount,
      total,
      paymentMethod,
      shippingMethod,
      shippingAddress,
      voucherCode,
      note,
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
      await pool.request()
        .input('orderId', sql.NVarChar, orderId)
        .input('productId', sql.NVarChar, item.productId)
        .input('productName', sql.NVarChar, item.productName || '')
        .input('productImage', sql.NVarChar, item.productImage || '')
        .input('price', sql.Decimal(18, 2), item.price || 0)
        .input('quantity', sql.Int, item.quantity || 1)
        .input('customization', sql.NVarChar(sql.MAX), JSON.stringify(item.customization || null))
        .query('INSERT INTO dbo.order_items (orderId, productId, productName, productImage, price, quantity, customization) VALUES (@orderId, @productId, @productName, @productImage, @price, @quantity, @customization)');
    }

    await pool.request()
      .input('orderId', sql.NVarChar, orderId)
      .input('status', sql.NVarChar, 'pending')
      .query('INSERT INTO dbo.order_timeline (orderId, status, date, note) VALUES (@orderId, @status, SYSUTCDATETIME(), NULL)');

    return res.status(201).json({ id: orderId, message: 'Order created successfully' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
