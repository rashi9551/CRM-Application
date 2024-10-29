import { Router } from "express";
import UserController from "../controllers/userController";
import TaskController from "../controllers/taskController";
import { isAdmin, isAdminOrBO, isAdminOrManagement, isPoAndToOrBo, isTo, verifyToken } from "../../utils/jwt";
import userController from "../controllers/userController";
import { uploadMiddleware } from "../../utils/multer";

const router=Router()


router.post('/login',UserController.login);

router.get('/getAllTasks',verifyToken,TaskController.getTasks);
router.get('/getAllAssignedTo',verifyToken,TaskController.getAllAssignedToUsers);
router.get('/getAllAssignedBy',verifyToken,TaskController.getAllAssignedByUsers);
router.get('/getTask/:id',verifyToken,TaskController.getTask);
router.post('/createTask',verifyToken,isAdminOrManagement,TaskController.createTask);
router.put('/updateTask',verifyToken,TaskController.updateTask);

router.delete('/deleteTask/:id',verifyToken,TaskController.deleteTask);

router.get('/getNotification/:id',verifyToken,TaskController.getNotification);
router.get('/getTaskHistory/:id',verifyToken,TaskController.getHistory);


router.post('/addComment', verifyToken, uploadMiddleware, TaskController.addComment); // Add upload middleware here
router.delete('/deleteComment/:id',verifyToken,TaskController.deleteComment);
router.get('/getComment/:id',verifyToken,TaskController.getComment);
router.put('/updateComment', verifyToken, uploadMiddleware, TaskController.updateComment); // Add upload middleware here

router.get('/filterTask',verifyToken,TaskController.getFilteredAndSortedTasks);
router.get('/getAnalytics',verifyToken,isAdminOrManagement,TaskController.getAnalytics);

router.delete('/removeContributes',verifyToken,isAdminOrManagement,TaskController.removeContributes);


export default router