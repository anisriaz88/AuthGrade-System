import Result from "../models/result.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Student controller to view grades
export const getMyGrades = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  if (!studentId) {
    throw new ApiError(400, "Student information is missing in user profile");
  }

  const results = await Result.find({ student: studentId })
    .populate("teacher", "name email")
    .sort({ updatedAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, "Grades retrieved successfully", results));
});
