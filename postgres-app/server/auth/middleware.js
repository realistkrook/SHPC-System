const SESSION_COOKIE_NAME = 'shpc_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const separatorIndex = entry.indexOf('=');
      if (separatorIndex === -1) {
        return acc;
      }

      const key = entry.slice(0, separatorIndex);
      const value = entry.slice(separatorIndex + 1);
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function toPublicProfile(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    is_active: row.is_active,
    last_login_at: row.last_login_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function createAuthMiddleware({ pool, sessionStore }) {
  async function attachCurrentUser(req, res, next) {
    const cookies = parseCookies(req.headers.cookie);
    const sessionToken = cookies[SESSION_COOKIE_NAME];

    req.sessionToken = sessionToken || null;
    req.user = null;

    if (!sessionToken) {
      next();
      return;
    }

    const session = sessionStore.getSession(sessionToken);
    if (!session) {
      clearSessionCookie(res);
      next();
      return;
    }

    try {
      const result = await pool.query(
        `SELECT id, full_name, email, role, is_active, last_login_at, created_at, updated_at
         FROM profiles
         WHERE id = $1 AND is_active = TRUE`,
        [session.userId]
      );

      if (result.rows.length === 0) {
        sessionStore.deleteSession(sessionToken);
        clearSessionCookie(res);
        next();
        return;
      }

      req.user = toPublicProfile(result.rows[0]);
      next();
    } catch (err) {
      next(err);
    }
  }

  function requireAuth(req, res, next) {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    next();
  }

  function requireRole(allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ error: 'You do not have permission to perform this action' });
        return;
      }

      next();
    };
  }

  function setSessionCookie(res, token) {
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: SESSION_TTL_MS,
      path: '/',
    });
  }

  function clearSessionCookie(res) {
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });
  }

  return {
    attachCurrentUser,
    requireAuth,
    requireRole,
    setSessionCookie,
    clearSessionCookie,
  };
}

module.exports = {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  createAuthMiddleware,
  parseCookies,
  toPublicProfile,
};
