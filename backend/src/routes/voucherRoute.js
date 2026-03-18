const express = require('express');
const { getPool, sql } = require('../libs/db');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM dbo.vouchers ORDER BY startDate DESC');
    return res.json(result.recordset);
  } catch (error) {
    return next(error);
  }
});

router.post('/validate', async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Voucher code is required' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('code', sql.NVarChar, String(code).toUpperCase())
      .query('SELECT TOP 1 * FROM dbo.vouchers WHERE code = @code');

    const voucher = result.recordset[0];
    if (!voucher) {
      return res.status(404).json({ valid: false, message: 'Voucher không tồn tại' });
    }

    const now = new Date();
    if (voucher.status !== 'active' || new Date(voucher.startDate) > now || new Date(voucher.endDate) < now) {
      return res.status(400).json({ valid: false, message: 'Voucher không còn hiệu lực' });
    }

    if (Number(subtotal) < Number(voucher.minOrderValue)) {
      return res.status(400).json({ valid: false, message: `Đơn hàng tối thiểu ${voucher.minOrderValue}` });
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ valid: false, message: 'Voucher đã hết lượt sử dụng' });
    }

    const discount = voucher.type === 'fixed'
      ? Number(voucher.value)
      : Math.min((Number(subtotal) * Number(voucher.value)) / 100, Number(voucher.maxDiscount || Number.MAX_SAFE_INTEGER));

    return res.json({ valid: true, voucher, discount });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
