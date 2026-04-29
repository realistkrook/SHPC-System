const crypto = require('node:crypto');

function createSessionStore({ ttlMs = 1000 * 60 * 60 * 8 } = {}) {
  const sessions = new Map();

  function purgeExpired(now = Date.now()) {
    for (const [token, session] of sessions.entries()) {
      if (session.expiresAt <= now) {
        sessions.delete(token);
      }
    }
  }

  return {
    createSession(userId) {
      purgeExpired();
      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, {
        userId,
        expiresAt: Date.now() + ttlMs,
      });
      return { token, expiresAt: sessions.get(token).expiresAt };
    },
    getSession(token) {
      const session = sessions.get(token);
      if (!session) {
        return null;
      }

      if (session.expiresAt <= Date.now()) {
        sessions.delete(token);
        return null;
      }

      return session;
    },
    deleteSession(token) {
      sessions.delete(token);
    },
    purgeExpired,
  };
}

module.exports = {
  createSessionStore,
};
