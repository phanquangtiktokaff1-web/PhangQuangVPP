const express = require('express');
const { getPool } = require('../libs/db');

const router = express.Router();

router.get('/stats', async (_req, res, next) => {
  try {
    const pool = await getPool();

    const [revenue, orders, products, customers, pendingOrders, lowStockProducts] = await Promise.all([
      pool.request().query("SELECT ISNULL(SUM(total),0) AS totalRevenue FROM dbo.orders WHERE status IN ('delivered','shipping','confirmed')"),
      pool.request().query('SELECT COUNT(1) AS totalOrders FROM dbo.orders'),
      pool.request().query('SELECT COUNT(1) AS totalProducts FROM dbo.products'),
      pool.request().query("SELECT COUNT(1) AS totalCustomers FROM dbo.users WHERE role = 'customer'"),
      pool.request().query("SELECT COUNT(1) AS pendingOrders FROM dbo.orders WHERE status = 'pending'"),
      pool.request().query('SELECT COUNT(1) AS lowStockProducts FROM dbo.products WHERE stock < 100'),
    ]);

    return res.json({
      totalRevenue: Number(revenue.recordset[0].totalRevenue),
      totalOrders: orders.recordset[0].totalOrders,
      totalProducts: products.recordset[0].totalProducts,
      totalCustomers: customers.recordset[0].totalCustomers,
      pendingOrders: pendingOrders.recordset[0].pendingOrders,
      lowStockProducts: lowStockProducts.recordset[0].lowStockProducts,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
