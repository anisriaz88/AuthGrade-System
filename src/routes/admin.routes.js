import express from 'express';
import { createAdmin,createUser, updateUser, deleteUser, getAllUsers } from '../Controller/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roles.middleware.js';

const routerAdmin = express.Router();

routerAdmin.post('/create-admin', createAdmin); // This route can be used to create an initial admin account (should be removed in production)

routerAdmin.use(authenticate); // All routes require authentication
routerAdmin.use(authorize('admin')); // Only admins can access these routes

routerAdmin.post('/create-users', createUser);
routerAdmin.put('/users/:id', updateUser);
routerAdmin.delete('/users/:id', deleteUser);
routerAdmin.get('/users', getAllUsers);

export default routerAdmin;