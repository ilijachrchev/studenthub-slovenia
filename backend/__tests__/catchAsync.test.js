const catchAsync = require("../middleware/catchAsync");

describe("catchAsync", () => {
    function mockRes() {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        return res;
    }

    test("calls the async function and passes through on success", async () => {
        const handler = catchAsync(async (req, res) => {
            res.json({ ok: true });
        });

        const req = {};
        const res = mockRes();

        await handler(req, res, jest.fn());

        expect(res.json).toHaveBeenCalledWith({ ok: true });
        expect(res.status).not.toHaveBeenCalled();
    });

    test("catches errors and returns 500 with safe message", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        const handler = catchAsync(async (req, res) => {
            throw new Error("database connection failed");
        });

        const req = {};
        const res = mockRes();

        await handler(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    test("does not expose error.message to client", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        const handler = catchAsync(async (req, res) => {
            throw new Error("SECRET_INTERNAL_DETAILS");
        });

        const req = {};
        const res = mockRes();

        await handler(req, res, jest.fn());

        expect(res.json).not.toHaveBeenCalledWith(
            expect.objectContaining({ error: "SECRET_INTERNAL_DETAILS" })
        );

        consoleSpy.mockRestore();
    });
});
