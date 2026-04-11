import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Result from "../models/result.model.js";

// Teacher controller to manage students and grades

// Get all students
export const getAllStudents = asyncHandler(async (req, res) => {
  const department = req.user.roleInfo.department;

  if (!department) {
    throw new ApiError(
      400,
      "Department information is missing in teacher profile",
    );
  }

  const students = await User.find({
    role: "student",
    "roleInfo.department": department,
  })
    .select("-password")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Students ${department} retrieved successfully`,
        students,
      ),
    );
});

// Add or update student grade(teacher only)
export const addOrUpdateGrade = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { course, subject, grade } = req.body;
  const subjectName = subject || course;

  if (!subjectName || !grade) {
    throw new ApiError(400, "Subject and grade are required");
  }

  const student = await User.findOne({ _id: studentId, role: "student" });
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (student.roleInfo.department !== req.user.roleInfo.department) {
    throw new ApiError(
      403,
      "You can only add grades for students in your department",
    );
  }

  let result = await Result.findOne({
    student: studentId,
    subject: subjectName,
  });

  if (result) {
    result.grade = grade;
    result.teacher = req.user._id;
    await result.save();
  } else {
    result = await Result.create({
      student: studentId,
      subject: subjectName,
      grade,
      teacher: req.user._id,
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Grade added/updated successfully", result));
});

// Get uploaded results
export const getResults = asyncHandler(async (req, res) => {
  const department = req.user.roleInfo.department;

  if (!department) {
    throw new ApiError(
      400,
      "Department information is missing in teacher profile",
    );
  }

  const studentsInDepartment = await User.find({
    role: "student",
    "roleInfo.department": department,
  }).select("_id");
  const studentIds = studentsInDepartment.map((student) => student._id);

  const results = await Result.find({ student: { $in: studentIds } })
    .populate("student", "name email roleInfo")
    .sort({ updatedAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Results for ${department} retrieved successfully`,
        results,
      ),
    );
});
