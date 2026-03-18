const express = require('express');
const { getPool, sql } = require('../libs/db');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { mapProductRow } = require('../utils/mapRows');

const router = express.Router();

// GET: get current user's wishlist (returns full product objects)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.NVarChar, req.user.userId)
      .query(`
        SELECT p.*, w.addedAt
        FROM dbo.wishlist w
        INNER JOIN dbo.products p ON p.id = w.productId
        WHERE w.userId = @userId
        ORDER BY w.addedAt DESC
      `);

    return res.json(result.recordset.map(row => ({
      ...mapProductRow(row),
      addedAt: row.addedAt,
    })));
  } catch (error) {
    return next(error);
  }
});

// POST: add a product to wishlist
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const pool = await getPool();

    // Check product exists
    const productCheck = await pool.request()
      .input('productId', sql.NVarChar, productId)
      .query('SELECT TOP 1 id FROM dbo.products WHERE id = @productId');
    if (productCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Upsert (ignore if already exists due to UNIQUE constraint)
    try {
      await pool.request()
        .input('userId', sql.NVarChar, req.user.userId)
        .input('productId', sql.NVarChar, productId)
        .query('INSERT INTO dbo.wishlist (userId, productId) VALUES (@userId, @productId)');
    } catch (dbErr) {
      // Unique constraint violation — already in wishlist, return 200 silently
      if (dbErr.number === 2627 || dbErr.number === 2601) {
        return res.json({ message: 'Already in wishlist' });
      }
      throw dbErr;
    }

    return res.status(201).json({ message: 'Added to wishlist' });
  } catch (error) {
    return next(error);
  }
});

// DELETE: remove a product from wishlist
router.delete('/:productId', authMiddleware, async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('userId', sql.NVarChar, req.user.userId)
      .input('productId', sql.NVarChar, req.params.productId)
      .query('DELETE FROM dbo.wishlist WHERE userId = @userId AND productId = @productId');
    return res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
