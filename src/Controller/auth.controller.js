import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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
  console.log(accessToken)

  const loggedInUser = await User.findById(user._id).select("-password");
  delete loggedInUser.password;

  res.status(200).json(
    new ApiResponse(200, "Login successful", {
      user: loggedInUser,
      accessToken,
    }),
  );
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, "Logout successful", null));
});
