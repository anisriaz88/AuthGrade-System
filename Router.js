import routerAuth from "./src/routes/auth.routes.js";
import routerAdmin from "./src/routes/admin.routes.js";
import routerTeacher from "./src/routes/teacher.routes.js";
import routerStudent from "./src/routes/student.routes.js";

const setupRoutes = (app) => {
    app.use('/api/auth', routerAuth);
    app.use('/api/admin', routerAdmin);
    app.use('/api/teacher', routerTeacher);
    app.use('/api/student', routerStudent);
};

export default setupRoutes;