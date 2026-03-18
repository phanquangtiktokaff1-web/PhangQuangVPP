function notFound(_req, res) {
  return res.status(404).json({ message: 'Not found' });
}

function errorHandler(err, _req, res, _next) {
  console.error('[error]', err);
  return res.status(500).json({
    message: 'Internal server error',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

module.exports = { notFound, errorHandler };
