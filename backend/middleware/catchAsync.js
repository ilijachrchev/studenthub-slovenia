const logger = require("./logger");

const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            logger.error({ err: error }, "Unhandled error");
            res.status(500).json({ error: "Internal server error" });
        });
    };
};

module.exports = catchAsync;
