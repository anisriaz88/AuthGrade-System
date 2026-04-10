import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

// Admin controller to manage users (create, read, update, delete)

// Create a new user (admin only)
export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, roleInfo } = req.body;
    if (!name || !email || !password || !role) {
        throw new ApiError(400, 'All fields are required');
    }

    const allowedRoles = ['admin', 'teacher', 'student'];
    if(!allowedRoles.includes(role)) {
         throw new ApiError(400, 'Invalid role');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, 'Already a user is registered with this email');
    }

    const user = await User.create(
        { 
            name, email, password, role, roleInfo: roleInfo  || {}
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
        new ApiResponse(201, {
        user: savedUser,
        accessToken
        }, 'User registered successfully'));
    });


// Get all users (admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
    const role = req.query.role;

    const filter = role ? { role } : {};

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res
    .status(200)
    .json(new ApiResponse(200, users, 'Users retrieved successfully'));
});


// update User (admin only)
export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const  updates = req.body;

   if(updates.role || updates.password){
        throw new ApiError(400, 'You cannot update role or password through this endpoint');
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
    .json(new ApiResponse(200, user, 'User updated successfully'));
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
    .json(new ApiResponse(200, null, 'User deleted successfully'));
});
