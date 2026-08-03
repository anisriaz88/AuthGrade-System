import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

// Admin controller to manage users (create, read, update, delete)

// Create a new user (admin only)
export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, roleInfo, } = req.body;

    if (!name || !email || !password || !role) {
        throw new ApiError(400, 'All fields are required');
    }

    const allowedRoles = ['admin', 'teacher', 'student'];
    if(!allowedRoles.includes(role)) {
         throw new ApiError(400, 'Invalid role');
    }

    if(role === 'teacher') {
        const hasAssignments = Array.isArray(roleInfo?.assignments) && roleInfo.assignments.length > 0;
        if (!roleInfo?.faculty || (!roleInfo?.class && !hasAssignments)) {
            throw new ApiError(400, 'Faculty name and at least one subject/department assignment are required for teacher role');
        }
    }

    if(role == 'student' && !roleInfo?.section) {
        throw new ApiError(400, 'Section is required for student role');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, 'Already a user is registered with this email');
    }

    const user = await User.create(
        { 
            name, email, password, role, roleInfo: roleInfo || {}, subject: roleInfo?.class || null,
        }
     );

     const accessToken = await user.generateAccessToken(
        user._id
     )

     const savedUser = await User.findById(user._id)
     .select('-password');


    res
    .status(201)
    .json(
        new ApiResponse(201, 'User registered successfully', {
        user: savedUser,
        accessToken
        }));
    });


// Get all users (admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
    const { role, batch, section } = req.query;

    const filter = {};
    if (role && role !== 'all') filter.role = role;

    if (batch && batch !== 'all') {
        filter.$or = [
            { 'roleInfo.batch': batch },
            { batch: batch },
            { 'roleInfo.assignments.batch': batch },
            { 'roleInfo.assignments.semester': batch }
        ];
    }

    if (section && section !== 'all') {
        const sectionFilter = [
            { 'roleInfo.section': section },
            { section: section },
            { 'roleInfo.assignments.section': section }
        ];
        if (filter.$or) {
            filter.$and = [
                { $or: filter.$or },
                { $or: sectionFilter }
            ];
            delete filter.$or;
        } else {
            filter.$or = sectionFilter;
        }
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res
    .status(200)
    .json(new ApiResponse(200, 'Users retrieved successfully', users));
});


// update User (admin only)
export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

   if(updates.role || updates.password){
        throw new ApiError(400, 'You cannot update role or password through this endpoint');
   }
    
   if (updates.roleInfo && updates.roleInfo.class) {
       updates.subject = updates.roleInfo.class;
   }

    const user = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res
    .status(200)
    .json(new ApiResponse(200, 'User updated successfully', user));
});


// delete User (admin only)
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if(id === req.user._id.toString()) {
        throw new ApiError(400, 'You cannot delete your own account');
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res
    .status(200)
    .json(new ApiResponse(200, 'User deleted successfully', null));
});
