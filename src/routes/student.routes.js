import express from 'express';
import { getMyGrades } from '../controller/student.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roles.middleware.js';

const routerStudent = express.Router();

routerStudent.use(authenticate); // All routes require authentication
routerStudent.use(authorize('student')); // Only students can access these routes

routerStudent.get('/my-grades', getMyGrades);

export default routerStudent;