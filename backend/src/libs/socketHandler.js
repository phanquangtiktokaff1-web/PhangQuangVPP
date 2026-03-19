const { getPool, sql } = require('./db');
const jwt = require('jsonwebtoken');

/**
 * Attach Socket.IO to the HTTP server and handle realtime chat events.
 * Each authenticated user joins their own room: `user:<userId>`
 * Admins also join the `admin` room.
 */
function attachSocketIO(io) {
  // Auth middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, role, email } = socket.user;

    // Join personal room
    void socket.join(`user:${userId}`);
    // Admins and staff join the admin room to receive all customer messages
    if (role === 'admin' || role === 'staff') {
      void socket.join('admin');
    }

    console.log(`[socket] Connected: ${email} (${role}) — socket ${socket.id}`);

    // ── Event: send_message ──────────────────────────────────────────────────
    socket.on('send_message', async (payload, callback) => {
      try {
        const { message, targetUserId } = payload || {};
        if (!message || !message.trim()) {
          if (callback) callback({ error: 'Message is required' });
          return;
        }

        const isAdmin = role === 'admin' || role === 'staff';
        if (isAdmin && !targetUserId) {
          if (callback) callback({ error: 'targetUserId required for admin' });
          return;
        }

        const pool = await getPool();
        const userResult = await pool.request()
          .input('uid', sql.NVarChar, userId)
          .query('SELECT TOP 1 name FROM dbo.users WHERE id = @uid');
        const senderName = userResult.recordset[0]?.name || email;

        const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const timestamp = new Date().toISOString();

        await pool.request()
          .input('id', sql.NVarChar, id)
          .input('senderId', sql.NVarChar, userId)
          .input('senderName', sql.NVarChar, senderName)
          .input('senderRole', sql.NVarChar, isAdmin ? 'admin' : 'customer')
          .input('targetUserId', sql.NVarChar, isAdmin ? targetUserId : null)
          .input('message', sql.NVarChar(sql.MAX), message.trim())
          .query(`
            INSERT INTO dbo.chat_messages (id, senderId, senderName, senderRole, targetUserId, message, [timestamp], isRead)
            VALUES (@id, @senderId, @senderName, @senderRole, @targetUserId, @message, SYSUTCDATETIME(), 0)
          `);

        const msgPayload = {
          id,
          senderId: userId,
          senderName,
          senderRole: isAdmin ? 'admin' : 'customer',
          targetUserId: isAdmin ? targetUserId : null,
          message: message.trim(),
          timestamp,
          isRead: false,
        };

        if (isAdmin) {
          // Emit to the target customer's personal room
          io.to(`user:${targetUserId}`).emit('new_message', msgPayload);
          // Also emit to admin room (so other admin tabs see it)
          io.to('admin').emit('new_message', msgPayload);
        } else {
          // Customer sends → emit to admin room and back to sender
          io.to('admin').emit('new_message', msgPayload);
          socket.emit('new_message', msgPayload);
        }

        if (callback) callback({ ok: true, id });
      } catch (err) {
        console.error('[socket] send_message error:', err);
        if (callback) callback({ error: 'Server error' });
      }
    });

    // ── Event: mark_read ─────────────────────────────────────────────────────
    socket.on('mark_read', async (payload) => {
      try {
        const pool = await getPool();
        const isAdmin = role === 'admin' || role === 'staff';
        if (isAdmin && payload?.userId) {
          await pool.request()
            .input('uid', sql.NVarChar, payload.userId)
            .query("UPDATE dbo.chat_messages SET isRead = 1 WHERE senderId = @uid AND senderRole = 'customer'");
        } else {
          await pool.request()
            .input('uid', sql.NVarChar, userId)
            .query("UPDATE dbo.chat_messages SET isRead = 1 WHERE targetUserId = @uid AND senderRole = 'admin'");
        }
      } catch (err) {
        console.error('[socket] mark_read error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[socket] Disconnected: ${email}`);
    });
  });
}

module.exports = { attachSocketIO };
