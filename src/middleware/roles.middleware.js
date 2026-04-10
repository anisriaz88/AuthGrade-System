import ApiError from '../utils/apiError.js';

// Middleware to check if the user has one of the allowed roles
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, 'You do not have access to this resource');
        }
        next();
    };
};