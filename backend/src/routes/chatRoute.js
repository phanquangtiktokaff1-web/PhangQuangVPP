const express = require('express');
const { getPool, sql } = require('../libs/db');

const router = express.Router();

router.get('/messages', async (_req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM dbo.chat_messages ORDER BY [timestamp]');
    const messages = result.recordset.map((row) => ({ ...row, isRead: Boolean(row.isRead) }));
    return res.json(messages);
  } catch (error) {
    return next(error);
  }
});

router.post('/messages', async (req, res, next) => {
  try {
    const { senderId, senderName, senderRole, message } = req.body;
    if (!senderId || !senderName || !senderRole || !message) {
      return res.status(400).json({ message: 'Missing chat message fields' });
    }

    const id = `msg-${Date.now()}`;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('senderId', sql.NVarChar, senderId)
      .input('senderName', sql.NVarChar, senderName)
      .input('senderRole', sql.NVarChar, senderRole)
      .input('message', sql.NVarChar(sql.MAX), message)
      .query('INSERT INTO dbo.chat_messages (id, senderId, senderName, senderRole, message, timestamp, isRead) VALUES (@id, @senderId, @senderName, @senderRole, @message, SYSUTCDATETIME(), 0)');

    return res.status(201).json({ id, message: 'Message sent' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
