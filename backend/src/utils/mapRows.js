function safeJsonParse(value, fallback) {
  try {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

function mapProductRow(row) {
  return {
    ...row,
    price: Number(row.price),
    originalPrice: Number(row.originalPrice),
    flashSalePrice: row.flashSalePrice !== null ? Number(row.flashSalePrice) : null,
    rating: Number(row.rating),
    images: safeJsonParse(row.images, []),
    specifications: safeJsonParse(row.specifications, {}),
    reviews: safeJsonParse(row.reviews, []),
    colors: safeJsonParse(row.colors, []),
    tags: safeJsonParse(row.tags, []),
    customizationOptions: safeJsonParse(row.customizationOptions, []),
    wholesalePrice: safeJsonParse(row.wholesalePrice, []),
    isFlashSale: Boolean(row.isFlashSale),
    isCustomizable: Boolean(row.isCustomizable),
  };
}

module.exports = { safeJsonParse, mapProductRow };
