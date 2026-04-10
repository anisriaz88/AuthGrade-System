import express from 'express';
import { getAllStudents, addOrUpdateGrade, getResults } from '../Controller/teacher.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roles.middleware.js';

const routerTeacher = express.Router();

routerTeacher.use(authenticate); // All routes require authentication
routerTeacher.use(authorize('teacher')); // All routes require 'teacher' role

routerTeacher.get('/my-students', getAllStudents);
routerTeacher.post('/grade/:studentId', addOrUpdateGrade);
routerTeacher.get('/results', getResults);

export default routerTeacher;