/**
 * Authentication and authorization middleware.
 *
 * requireAuth — ensures req.session.user exists, otherwise 401.
 * requireRole(role) — ensures the authenticated user has the specified role, otherwise 403.
 */

function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }
    next();
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ error: "Not logged in" });
        }
        if (req.session.user.role !== role) {
            return res.status(403).json({ error: `Only ${role}s can access this` });
        }
        next();
    };
}

module.exports = { requireAuth, requireRole };
