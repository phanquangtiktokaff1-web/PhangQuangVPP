const express = require('express');
const { getPool, sql } = require('../libs/db');
const { mapProductRow } = require('../utils/mapRows');

const router = express.Router();

router.get('/categories', async (_req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM dbo.categories ORDER BY name');
    return res.json(result.recordset);
  } catch (error) {
    return next(error);
  }
});

router.get('/brands', async (_req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM dbo.brands ORDER BY name');
    return res.json(result.recordset);
  } catch (error) {
    return next(error);
  }
});

router.get('/products', async (req, res, next) => {
  try {
    const { categoryId, brandId, q, sortBy = 'popular' } = req.query;
    const pool = await getPool();
    const request = pool.request();

    const conditions = [];
    if (categoryId) {
      request.input('categoryId', sql.NVarChar, String(categoryId));
      conditions.push('categoryId = @categoryId');
    }
    if (brandId) {
      request.input('brandId', sql.NVarChar, String(brandId));
      conditions.push('brandId = @brandId');
    }
    if (q) {
      request.input('q', sql.NVarChar, `%${String(q)}%`);
      conditions.push('(name LIKE @q OR sku LIKE @q OR tags LIKE @q)');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'sold DESC';
    if (sortBy === 'price-asc') orderBy = 'price ASC';
    if (sortBy === 'price-desc') orderBy = 'price DESC';
    if (sortBy === 'newest') orderBy = 'createdAt DESC';
    if (sortBy === 'rating') orderBy = 'rating DESC';

    const result = await request.query(`SELECT * FROM dbo.products ${whereClause} ORDER BY ${orderBy}`);
    return res.json(result.recordset.map(mapProductRow));
  } catch (error) {
    return next(error);
  }
});

router.get('/products/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('idOrSlug', sql.NVarChar, idOrSlug)
      .query('SELECT TOP 1 * FROM dbo.products WHERE id = @idOrSlug OR slug = @idOrSlug');

    const row = result.recordset[0];
    if (!row) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(mapProductRow(row));
  } catch (error) {
    return next(error);
  }
});

router.get('/search-suggestions', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json([]);
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('q', sql.NVarChar, `%${q}%`)
      .query('SELECT TOP 5 name FROM dbo.products WHERE name LIKE @q ORDER BY sold DESC');

    return res.json(result.recordset.map((r) => r.name));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
