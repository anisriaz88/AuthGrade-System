import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const isSecureRequest = (req) => {
  return req.secure || req.headers["x-forwarded-proto"] === "https" || process.env.VERCEL === "1";
};

const getAuthCookieOptions = (req) => {
  const secure = isSecureRequest(req);

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
  };
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const accessToken = await user.generateAccessToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password");
  delete loggedInUser.password;

  res.cookie("accessToken", accessToken, getAuthCookieOptions(req));

  res.status(200).json(
    new ApiResponse(200, "Login successful", {
      user: loggedInUser,
      accessToken,
    }),
  );
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", getAuthCookieOptions(req));
  res.status(200).json(new ApiResponse(200, "Logout successful", null));
});
