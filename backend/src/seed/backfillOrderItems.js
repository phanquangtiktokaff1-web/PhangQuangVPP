require('dotenv').config();

const { getPool, closePool, sql } = require('../libs/db');
const { safeJsonParse } = require('../utils/mapRows');

function getFirstImageUrl(imagesJson) {
  const images = safeJsonParse(imagesJson, []);
  if (!Array.isArray(images) || images.length === 0) return '';
  return typeof images[0]?.url === 'string' ? images[0].url : '';
}

function normalizeCustomization(rawCustomization) {
  const parsed = safeJsonParse(rawCustomization, null);
  if (!parsed || typeof parsed !== 'object') return null;

  const type = typeof parsed.type === 'string' ? parsed.type.trim() : '';
  const text = typeof parsed.text === 'string' ? parsed.text.trim() : '';

  if (!type || !text) return null;
  return { type, text };
}

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

async function run() {
  const pool = await getPool();

  const rowsResult = await pool.request().query(`
    SELECT
      oi.id,
      oi.productId,
      oi.productName,
      oi.productImage,
      oi.customization,
      p.name AS productNameFromProduct,
      p.images AS productImagesFromProduct
    FROM dbo.order_items oi
    LEFT JOIN dbo.products p ON p.id = oi.productId
  `);

  const rows = rowsResult.recordset;
  let scanned = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    scanned += 1;

    const currentName = hasValue(row.productName) ? row.productName.trim() : '';
    const currentImage = hasValue(row.productImage) ? row.productImage.trim() : '';
    const fallbackName = hasValue(row.productNameFromProduct) ? row.productNameFromProduct.trim() : '';
    const fallbackImage = getFirstImageUrl(row.productImagesFromProduct);

    const nextName = currentName || fallbackName;
    const nextImage = currentImage || fallbackImage;

    const normalizedCustomization = normalizeCustomization(row.customization);
    const currentCustomization = safeJsonParse(row.customization, null);

    const shouldUpdateName = nextName !== row.productName;
    const shouldUpdateImage = nextImage !== (row.productImage || '');
    const shouldUpdateCustomization = JSON.stringify(normalizedCustomization) !== JSON.stringify(currentCustomization);

    if (!shouldUpdateName && !shouldUpdateImage && !shouldUpdateCustomization) {
      skipped += 1;
      continue;
    }

    await pool.request()
      .input('id', sql.Int, row.id)
      .input('productName', sql.NVarChar(255), nextName || '')
      .input('productImage', sql.NVarChar(500), nextImage || '')
      .input('customization', sql.NVarChar(sql.MAX), JSON.stringify(normalizedCustomization))
      .query(`
        UPDATE dbo.order_items
        SET productName = @productName,
            productImage = @productImage,
            customization = @customization
        WHERE id = @id
      `);

    updated += 1;
  }

  console.log('Backfill order_items completed.');
  console.log(`Scanned: ${scanned}`);
  console.log(`Updated: ${updated}`);
  console.log(`Unchanged: ${skipped}`);
}

run()
  .catch((error) => {
    console.error('Backfill order_items failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await closePool();
    } catch {
      // ignore close errors
    }
  });
