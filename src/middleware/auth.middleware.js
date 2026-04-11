import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";

// Middleware to authenticate users using JWT access tokens

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader && authHeader.split(" ")[1]; // Extract token from

  if (!token) {
    throw new ApiError(401, "No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decoded.id || decoded._id;
    req.user = await User.findById(userId).select("-password");

    if (!req.user) {
      throw new ApiError(401, "Invalid token");
    }

    next();
  } catch (err) {
    throw new ApiError(401, "Invalid token");
  }
});
