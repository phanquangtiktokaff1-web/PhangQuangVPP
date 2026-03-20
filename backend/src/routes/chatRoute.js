const express = require('express');
const { getPool, sql } = require('../libs/db');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// ==================== CONVERSATIONS (Admin only) ====================
// Returns list of unique customers who have sent messages, with unread count and last message

router.get('/conversations', authMiddleware, adminMiddleware, async (_req, res, next) => {
  try {
    const pool = await getPool();

    // Get all unique senders (customers) with latest message and unread count
    const result = await pool.request().query(`
      SELECT
        m.senderId AS userId,
        MAX(u.name) AS userName,
        MAX(u.avatar) AS userAvatar,
        MAX(m.[timestamp]) AS lastMessageAt,
        (
          SELECT TOP 1 message FROM dbo.chat_messages
          WHERE senderId = m.senderId
          ORDER BY [timestamp] DESC
        ) AS lastMessage,
        SUM(CASE WHEN m.isRead = 0 AND m.senderRole = 'customer' THEN 1 ELSE 0 END) AS unreadCount
      FROM dbo.chat_messages m
      LEFT JOIN dbo.users u ON u.id = m.senderId
      WHERE m.senderRole = 'customer'
      GROUP BY m.senderId
      ORDER BY lastMessageAt DESC
    `);

    return res.json(result.recordset);
  } catch (error) {
    return next(error);
  }
});

// ==================== MESSAGES ====================
// Customer: GET own messages. Admin: GET messages for specific userId

router.get('/messages', authMiddleware, async (req, res, next) => {
  try {
    const pool = await getPool();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

    let targetUserId;
    if (isAdmin) {
      targetUserId = req.query.userId;
      if (!targetUserId) {
        return res.status(400).json({ message: 'userId query param required for admin' });
      }
    } else {
      targetUserId = req.user.userId;
    }

    // Fetch all messages belonging to the conversation of this customer
    const result = await pool.request()
      .input('userId', sql.NVarChar, targetUserId)
      .query(`
        SELECT *
        FROM dbo.chat_messages
        WHERE senderId = @userId OR targetUserId = @userId
        ORDER BY [timestamp] ASC
      `);

    const messages = result.recordset.map(r => ({ ...r, isRead: Boolean(r.isRead) }));
    return res.json(messages);
  } catch (error) {
    return next(error);
  }
});

// POST a message
// Customer: senderId = self, targetUserId = null (auto = admin)
// Admin: senderId = self, targetUserId = customer's userId (required)

router.post('/messages', authMiddleware, async (req, res, next) => {
  try {
    const { message, targetUserId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

    if (isAdmin && !targetUserId) {
      return res.status(400).json({ message: 'targetUserId is required when admin sends a message' });
    }

    // Get sender name
    const pool = await getPool();
    const userResult = await pool.request()
      .input('userId', sql.NVarChar, req.user.userId)
      .query('SELECT TOP 1 name FROM dbo.users WHERE id = @userId');
    const senderName = userResult.recordset[0]?.name || req.user.email;

    const id = `msg-${Date.now()}`;
    const messageText = message.trim();
    const timestamp = new Date().toISOString();
    await pool.request()
      .input('id', sql.NVarChar, id)
      .input('senderId', sql.NVarChar, req.user.userId)
      .input('senderName', sql.NVarChar, senderName)
      .input('senderRole', sql.NVarChar, isAdmin ? 'admin' : 'customer')
      .input('targetUserId', sql.NVarChar, isAdmin ? targetUserId : null)
      .input('message', sql.NVarChar(sql.MAX), messageText)
      .query(`
        INSERT INTO dbo.chat_messages (id, senderId, senderName, senderRole, targetUserId, message, [timestamp], isRead)
        VALUES (@id, @senderId, @senderName, @senderRole, @targetUserId, @message, SYSUTCDATETIME(), 0)
      `);

    const io = req.app.get('io');
    const msgPayload = {
      id,
      senderId: req.user.userId,
      senderName,
      senderRole: isAdmin ? 'admin' : 'customer',
      targetUserId: isAdmin ? targetUserId : null,
      message: messageText,
      timestamp,
      isRead: false,
    };

    if (io) {
      if (isAdmin) {
        io.to(`user:${targetUserId}`).emit('new_message', msgPayload);
        io.to('admin').emit('new_message', msgPayload);
      } else {
        io.to('admin').emit('new_message', msgPayload);
        io.to(`user:${req.user.userId}`).emit('new_message', msgPayload);
      }
    }

    return res.status(201).json({ id, message: 'Message sent' });
  } catch (error) {
    return next(error);
  }
});

// PATCH: mark messages from a specific user as read (admin marks customer messages as read)
router.patch('/messages/read', authMiddleware, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';
    const pool = await getPool();

    if (isAdmin) {
      // Admin marks all messages from a specific customer as read
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ message: 'userId required' });

      await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query("UPDATE dbo.chat_messages SET isRead = 1 WHERE senderId = @userId AND senderRole = 'customer'");
    } else {
      // Customer marks admin replies as read
      await pool.request()
        .input('userId', sql.NVarChar, req.user.userId)
        .query("UPDATE dbo.chat_messages SET isRead = 1 WHERE targetUserId = @userId AND senderRole = 'admin'");
    }

    return res.json({ message: 'Messages marked as read' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
