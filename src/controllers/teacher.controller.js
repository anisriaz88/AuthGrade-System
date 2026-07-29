import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Result from "../models/result.model.js";

// Teacher controller to manage students and grades

// Get all students
export const getAllStudents = asyncHandler(async (req, res) => {
  const roleInfo = req.user.roleInfo || {};
  const queryDept = req.query.department;
  const queryBatch = req.query.batch;
  const querySemester = req.query.semester;
  const querySection = req.query.section;
  const assignments = Array.isArray(roleInfo.assignments) ? roleInfo.assignments : [];
  
  const deptsSet = new Set();
  if (roleInfo.department) deptsSet.add(roleInfo.department);
  if (Array.isArray(roleInfo.departments)) {
    roleInfo.departments.forEach((d) => d && deptsSet.add(d));
  }
  assignments.forEach((a) => {
    if (a.department) deptsSet.add(a.department);
  });

  const authorizedDepartments = Array.from(deptsSet);

  if (authorizedDepartments.length === 0) {
    throw new ApiError(
      400,
      "Department information is missing in teacher profile",
    );
  }

  let filterDepartments = authorizedDepartments;
  if (queryDept) {
    const matched = authorizedDepartments.find(
      (d) => d.toLowerCase() === queryDept.toLowerCase()
    );
    if (matched) {
      filterDepartments = [matched];
    }
  }

  const queryFilter = {
    role: "student",
    "roleInfo.department": { $in: filterDepartments },
  };

  if (querySemester && querySemester.trim()) {
    queryFilter["roleInfo.semester"] = { $regex: new RegExp(`^${querySemester.trim()}$`, "i") };
  } else if (queryBatch && queryBatch.trim()) {
    queryFilter["roleInfo.batch"] = { $regex: new RegExp(`^${queryBatch.trim()}$`, "i") };
  }

  if (querySection && querySection.trim()) {
    queryFilter["roleInfo.section"] = { $regex: new RegExp(`^${querySection.trim()}$`, "i") };
  }

  const students = await User.find(queryFilter)
    .select("-password")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Students for ${filterDepartments.join(", ")} retrieved successfully`,
        students,
      ),
    );
});

// Add or update student grade(teacher only)
export const addOrUpdateGrade = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { course, subject, grade } = req.body;
  const subjectName = (subject || course || "").trim();

  if (!subjectName || !grade) {
    throw new ApiError(400, "Subject and grade are required");
  }

  const roleInfo = req.user.roleInfo || {};
  const assignments = Array.isArray(roleInfo.assignments) ? roleInfo.assignments : [];

  const allowedSubjectsSet = new Set();
  if (req.user.subject) allowedSubjectsSet.add(req.user.subject.toLowerCase().trim());
  if (roleInfo.class) allowedSubjectsSet.add(roleInfo.class.toLowerCase().trim());
  assignments.forEach((a) => {
    if (a.subject) allowedSubjectsSet.add(a.subject.toLowerCase().trim());
  });

  const allowedDeptsSet = new Set();
  if (roleInfo.department) allowedDeptsSet.add(roleInfo.department.toLowerCase().trim());
  if (Array.isArray(roleInfo.departments)) {
    roleInfo.departments.forEach((d) => d && allowedDeptsSet.add(d.toLowerCase().trim()));
  }
  assignments.forEach((a) => {
    if (a.department) allowedDeptsSet.add(a.department.toLowerCase().trim());
  });

  const student = await User.findOne({ _id: studentId, role: "student" });
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const studentDept = student.roleInfo?.department;
  if (
    allowedDeptsSet.size > 0 &&
    (!studentDept || !allowedDeptsSet.has(studentDept.toLowerCase().trim()))
  ) {
    throw new ApiError(
      403,
      "You can only add grades for students in your assigned departments",
    );
  }

  if (
    allowedSubjectsSet.size > 0 &&
    !allowedSubjectsSet.has(subjectName.toLowerCase())
  ) {
    throw new ApiError(
      403,
      `Access Denied: You are only authorized to add or edit grades for your assigned subject(s)`,
    );
  }

  let result = await Result.findOne({
    student: studentId,
    subject: { $regex: new RegExp(`^${subjectName}$`, "i") },
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

// Get uploaded results (only for teacher's own assigned subjects / uploads)
export const getResults = asyncHandler(async (req, res) => {
  const roleInfo = req.user.roleInfo || {};
  const assignments = Array.isArray(roleInfo.assignments) ? roleInfo.assignments : [];

  const allowedSubjectsSet = new Set();
  if (req.user.subject) allowedSubjectsSet.add(req.user.subject.trim());
  if (roleInfo.class) allowedSubjectsSet.add(roleInfo.class.trim());
  assignments.forEach((a) => {
    if (a.subject) allowedSubjectsSet.add(a.subject.trim());
  });

  const allowedSubjects = Array.from(allowedSubjectsSet);

  if (allowedSubjects.length === 0) {
    // If no subject set on teacher, fallback to results where teacher = req.user._id
    const results = await Result.find({ teacher: req.user._id })
      .populate("student", "name email roleInfo")
      .sort({ updatedAt: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, "Results retrieved successfully", results));
  }

  const subjectRegexes = allowedSubjects.map(
    (s) => new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  );

  const results = await Result.find({
    $or: [{ teacher: req.user._id }, { subject: { $in: subjectRegexes } }],
  })
    .populate("student", "name email roleInfo")
    .sort({ updatedAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Results for assigned subjects retrieved successfully`,
        results,
      ),
    );
});
