const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        });
    };
};

module.exports = catchAsync;
