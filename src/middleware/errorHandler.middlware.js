import asyncHandler from "../utils/asyncHandler.js";

// Global error handling middleware
const errorHandler = asyncHandler(async (err, req, res) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

export default errorHandler;