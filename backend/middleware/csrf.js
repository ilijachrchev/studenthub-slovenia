const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:30010",
    "http://localhost:30011",
].filter(Boolean);

function validateOrigin(req, res, next) {
    if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
        return next();
    }

    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const referer = req.headers.referer;
    if (!origin && referer) {
        const refererOrigin = new URL(referer).origin;
        if (!allowedOrigins.includes(refererOrigin)) {
            return res.status(403).json({ error: "Forbidden" });
        }
    }

    next();
}

module.exports = { validateOrigin };
